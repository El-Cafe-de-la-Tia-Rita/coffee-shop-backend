import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';
import { InventoryMovementReason } from '@common/enums/inventory-movement-reason.enum';
import { MovementType } from '@common/enums/movement-type.enum';
import { FilterOrderDto } from './dto/filter-order.dto';
import { PaginationResult } from '@common/interfaces/pagination-result.interface';
import { OrderStatsDto } from './dto/order-stats.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementsRepository: Repository<InventoryMovement>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createPublicOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Buscar usuario del sistema
    const systemUser = await this.usersRepository.findOne({
      where: { email: 'system@coffeeshop.com' }
    });

    if (!systemUser) {
      throw new Error('System user not found. Please create a system user with email: system@coffeeshop.com');
    }

    return this.create(createOrderDto, systemUser);
  }

  async create(createOrderDto: CreateOrderDto, currentUser: User): Promise<Order> {
    const {
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      orderItems,
      discount,
      shipping,
      delivery_date_estimated,
      delivery_address,
      origin,
      payment_method,
      notes,
    } = createOrderDto;

    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const orderItemRepository = manager.getRepository(OrderItem);
      const clientRepository = manager.getRepository(Client);
      const productRepository = manager.getRepository(Product);
      const inventoryMovementRepository = manager.getRepository(InventoryMovement);

      // 1. Handle Client (find existing or create new)
      let client: Client;
      
      if (clientId) {
        // Caso 1: Se proporciona clientId (pedidos internos del staff)
        const foundClient = await clientRepository.findOneBy({ id: clientId });
        if (!foundClient) {
          throw new NotFoundException(`Client with ID "${clientId}" not found`);
        }
        client = foundClient;
      } else if (clientName && clientEmail && clientPhone) {
        // Caso 2: No se proporciona clientId (pedidos públicos)
        // Buscar cliente existente por email O teléfono
        let existingClient = await clientRepository.findOne({
          where: [{ email: clientEmail }, { phone: clientPhone }],
        });

        if (existingClient) {
          // Cliente encontrado - actualizar su información si es necesario
          let needsUpdate = false;
          
          // Actualizar campos si son diferentes
          if (existingClient.name !== clientName) {
            existingClient.name = clientName;
            needsUpdate = true;
          }
          if (existingClient.email !== clientEmail) {
            existingClient.email = clientEmail;
            needsUpdate = true;
          }
          if (existingClient.phone !== clientPhone) {
            existingClient.phone = clientPhone;
            needsUpdate = true;
          }
          if (existingClient.address !== delivery_address) {
            existingClient.address = delivery_address;
            needsUpdate = true;
          }

          if (needsUpdate) {
            client = await clientRepository.save(existingClient);
          } else {
            client = existingClient;
          }
        } else {
          // Cliente no encontrado - crear uno nuevo
          const newClient = clientRepository.create({
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            address: delivery_address,
            district: 'N/A',
            marketing_opt_in: false,
          });
          client = await clientRepository.save(newClient);
        }
      } else {
        throw new BadRequestException('Client ID or new client details (name, email, phone) must be provided.');
      }

      // 2. Validate Stock and Calculate Totals
      let subtotal = 0;
      const createdOrderItems: OrderItem[] = [];
      const productUpdates: Product[] = [];

      for (const itemDto of orderItems) {
        const product = await productRepository.findOne({ where: { id: itemDto.productId }, relations: ['product_catalog'] });
        if (!product) {
          throw new NotFoundException(`Product with ID "${itemDto.productId}" not found.`);
        }
        if (product.stock_current < itemDto.quantity) {
          throw new BadRequestException(`Not enough stock for product "${product.sku}". Available: ${product.stock_current}, Requested: ${itemDto.quantity}`);
        }

        // Calculate item totals
        const itemSubtotal = product.sale_price * itemDto.quantity;
        subtotal += itemSubtotal;

        // Create OrderItem
        const orderItem = orderItemRepository.create({
          order: undefined,
          product_stock: product,
          quantity: itemDto.quantity,
          unit_price: product.sale_price,
          subtotal: itemSubtotal,
          sold_kg: (product.product_catalog.weight_grams / 1000) * itemDto.quantity,
        });
        createdOrderItems.push(orderItem);

        // Prepare product for stock update
        product.stock_current -= itemDto.quantity;
        product.stock_reserved += itemDto.quantity;
        productUpdates.push(product);
      }

      // Calculate final order total
      const total = subtotal - (discount ?? 0) + (shipping ?? 0);
      if (total < 0) {
        throw new BadRequestException('Order total cannot be negative.');
      }

      // 3. Create Order
      const orderNumber = `ORD-${Date.now()}`;
      const newOrder = orderRepository.create({
        order_number: orderNumber,
        client,
        created_by: currentUser,
        status: OrderStatus.PENDING,
        order_date: new Date(),
        delivery_date_estimated,
        delivery_date_real: null,
        subtotal,
        discount: discount ?? 0,
        shipping: shipping ?? 0,
        total,
        payment_method,
        payment_confirmed: false,
        payment_receipt_url: null,
        notes: notes ?? null,
        delivery_address,
        origin,
      });
      const savedOrder = await orderRepository.save(newOrder);

      // 4. Link OrderItems to Order and Save
      for (const orderItem of createdOrderItems) {
        orderItem.order = savedOrder;
        await orderItemRepository.save(orderItem);

        // 5. Create InventoryMovement for each order item (OUTBOUND)
        const inventoryMovement = inventoryMovementRepository.create({
          quantity: orderItem.quantity,
          movement_type: MovementType.OUTBOUND,
          product_stock: orderItem.product_stock,
          user: currentUser,
          unit: orderItem.product_stock.product_catalog.package_type,
          movement_date: new Date(),
          reason: InventoryMovementReason.SALE,
          reference: savedOrder.order_number,
        });
        await inventoryMovementRepository.save(inventoryMovement);
      }

      // 6. Update Product Stock
      for (const product of productUpdates) {
        await productRepository.save(product);
      }

      return savedOrder;
    });
  }

  async findAll(filterDto: FilterOrderDto): Promise<PaginationResult<Order>> {
    const { page = 1, limit = 10, clientId, status, paymentMethod, origin, startDate, endDate, paymentConfirmed } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ordersRepository.createQueryBuilder('order');
    queryBuilder.leftJoinAndSelect('order.client', 'client');
    queryBuilder.leftJoinAndSelect('order.created_by', 'user');
    queryBuilder.leftJoinAndSelect('order.items', 'orderItem');
    queryBuilder.leftJoinAndSelect('orderItem.product_stock', 'product_stock');
    queryBuilder.leftJoinAndSelect('product_stock.product_catalog', 'product_catalog');

    if (clientId) queryBuilder.andWhere('client.id = :clientId', { clientId });
    if (status) queryBuilder.andWhere('order.status = :status', { status });
    if (paymentMethod) queryBuilder.andWhere('order.payment_method = :paymentMethod', { paymentMethod });
    if (origin) queryBuilder.andWhere('order.origin = :origin', { origin });
    if (typeof paymentConfirmed === 'boolean') queryBuilder.andWhere('order.payment_confirmed = :paymentConfirmed', { paymentConfirmed });

    if (startDate && endDate) {
  // Convert YYYY-MM-DD to full datetime range
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  queryBuilder.andWhere('order.order_date >= :startDate AND order.order_date <= :endDate', { 
    startDate: start.toISOString(), 
    endDate: end.toISOString() 
  });
} else if (startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  queryBuilder.andWhere('order.order_date >= :startDate', { startDate: start.toISOString() });
} else if (endDate) {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  queryBuilder.andWhere('order.order_date <= :endDate', { endDate: end.toISOString() });
}

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('order.order_date', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['client', 'created_by', 'items', 'items.product_stock', 'items.product_stock.product_catalog'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Only allow updating notes and delivery_address
    const allowedUpdates: Partial<Order> = {};
    if (updateOrderDto.notes !== undefined) allowedUpdates.notes = updateOrderDto.notes;
    if (updateOrderDto.delivery_address) allowedUpdates.delivery_address = updateOrderDto.delivery_address;
    if (updateOrderDto.delivery_date_estimated) allowedUpdates.delivery_date_estimated = updateOrderDto.delivery_date_estimated;
    
    if (Object.keys(allowedUpdates).length === 0) {
      throw new BadRequestException('No updatable fields provided or you do not have permission to update these fields.');
    }

    await this.ordersRepository.update(id, allowedUpdates);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.ordersRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
  }

  async updateStatus(id: string, newStatus: OrderStatus, currentUser: User): Promise<Order> {
    const order = await this.findOne(id);
    if (order.status === newStatus) {
      return order;
    }

    // Perform specific actions based on status change
    if (newStatus === OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERED) {
      if (!order.payment_confirmed) {
        order.payment_confirmed = true;
      }
      order.delivery_date_real = new Date().toISOString().split('T')[0];
    }

    if (newStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Use the /cancel endpoint to cancel an order to ensure proper stock restoration.');
    }

    order.status = newStatus;
    return this.ordersRepository.save(order);
  }

  async confirmPayment(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (order.payment_confirmed) {
      throw new BadRequestException('Payment is already confirmed for this order.');
    }
    order.payment_confirmed = true;
    return this.ordersRepository.save(order);
  }

  async cancelOrder(id: string, currentUser: User): Promise<Order> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.CANCELLED) {
      return order;
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const productRepository = manager.getRepository(Product);
      const inventoryMovementRepository = manager.getRepository(InventoryMovement);

      order.status = OrderStatus.CANCELLED;
      const cancelledOrder = await orderRepository.save(order);

      // Restore stock for each item
      for (const item of cancelledOrder.items) {
        const product = await productRepository.findOneBy({ id: item.product_stock.id });
        if (product) {
          product.stock_current += item.quantity;
          product.stock_reserved -= item.quantity;
          await productRepository.save(product);

          // Create InventoryMovement for stock restoration
          const inventoryMovement = inventoryMovementRepository.create({
            quantity: item.quantity,
            movement_type: MovementType.INBOUND,
            product_stock: product,
            user: currentUser,
            unit: item.product_stock.product_catalog.package_type,
            movement_date: new Date(),
            reason: InventoryMovementReason.RETURN,
            reference: cancelledOrder.order_number,
          });
          await inventoryMovementRepository.save(inventoryMovement);
        }
      }
      return cancelledOrder;
    });
  }

  async findByClient(clientId: string, filterDto: FilterOrderDto): Promise<PaginationResult<Order>> {
    const { page = 1, limit = 10, status, paymentMethod, origin, startDate, endDate, paymentConfirmed } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ordersRepository.createQueryBuilder('order');
    queryBuilder.leftJoinAndSelect('order.client', 'client');
    queryBuilder.leftJoinAndSelect('order.created_by', 'user');
    queryBuilder.leftJoinAndSelect('order.items', 'orderItem');
    queryBuilder.leftJoinAndSelect('orderItem.product_stock', 'product_stock');
    queryBuilder.leftJoinAndSelect('product_stock.product_catalog', 'product_catalog');

    queryBuilder.andWhere('client.id = :clientId', { clientId });

    if (status) queryBuilder.andWhere('order.status = :status', { status });
    if (paymentMethod) queryBuilder.andWhere('order.payment_method = :paymentMethod', { paymentMethod });
    if (origin) queryBuilder.andWhere('order.origin = :origin', { origin });
    if (typeof paymentConfirmed === 'boolean') queryBuilder.andWhere('order.payment_confirmed = :paymentConfirmed', { paymentConfirmed });

    if (startDate && endDate) {
  // Convert YYYY-MM-DD to full datetime range
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  queryBuilder.andWhere('order.order_date >= :startDate AND order.order_date <= :endDate', { 
    startDate: start.toISOString(), 
    endDate: end.toISOString() 
  });
} else if (startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  queryBuilder.andWhere('order.order_date >= :startDate', { startDate: start.toISOString() });
} else if (endDate) {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  queryBuilder.andWhere('order.order_date <= :endDate', { endDate: end.toISOString() });
}

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('order.order_date', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getStatistics(): Promise<OrderStatsDto> {
    const totalOrders = await this.ordersRepository.count();
    const totalRevenueResult = await this.ordersRepository.sum('total');
    const totalRevenue = totalRevenueResult || 0;

    const statusCounts = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const statusDistribution: Record<OrderStatus, number> = statusCounts.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<OrderStatus, number>);

    // Orders by day (last 7 days)
    const ordersByDay = await this.ordersRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.order_date, 'YYYY-MM-DD')", 'label')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.total)', 'totalAmount')
      .where('order.order_date >= :sevenDaysAgo', { sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
      .groupBy('label')
      .orderBy('label', 'ASC')
      .getRawMany();

    // Orders by product (top 5)
    const ordersByProduct = await this.orderItemsRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.product_stock', 'product_stock')
      .leftJoinAndSelect('product_stock.product_catalog', 'product_catalog')
      .select('product_catalog.name', 'label')
      .addSelect('SUM(orderItem.quantity)', 'count')
      .addSelect('SUM(orderItem.subtotal)', 'totalAmount')
      .groupBy('product_catalog.name')
      .orderBy('totalAmount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalOrders,
      totalRevenue,
      statusDistribution,
      ordersByDay: ordersByDay.map(row => ({
        label: row.label,
        count: parseInt(row.count, 10),
        totalAmount: parseFloat(row.totalAmount),
      })),
      ordersByProduct: ordersByProduct.map(row => ({
        label: row.label,
        count: parseInt(row.count, 10),
        totalAmount: parseFloat(row.totalAmount),
      })),
    };
  }
}