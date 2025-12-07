import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { DashboardSalesMetricsDto } from './dto/dashboard-sales-metrics.dto';
import { DashboardInventoryMetricsDto } from './dto/dashboard-inventory-metrics.dto';
import { DashboardTopClientsDto } from './dto/dashboard-top-clients.dto';
import { DashboardTopProductsDto } from './dto/dashboard-top-products.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async getOverview(filter: DashboardFilterDto): Promise<DashboardOverviewDto> {
    const { startDate, endDate } = filter;
    const orderDateRange = startDate && endDate ? Between(new Date(startDate), new Date(endDate)) : undefined;
    const expenseDateRange = startDate && endDate ? Between(startDate, endDate) : undefined; // Expense date is string

    const totalSalesResult = await this.ordersRepository.sum('total', {
      order_date: orderDateRange,
      status: OrderStatus.DELIVERED, // Only count delivered orders as sales
    });
    const totalSales = totalSalesResult || 0;

    const totalExpensesResult = await this.expensesRepository.sum('amount', {
      date: expenseDateRange,
    });
    const totalExpenses = totalExpensesResult || 0;

    const netProfit = totalSales - totalExpenses;

    return { totalSales, totalExpenses, netProfit };
  }

  async getSalesMetrics(filter: DashboardFilterDto): Promise<DashboardSalesMetricsDto> {
    const { startDate, endDate } = filter;
    const orderDateRange = startDate && endDate ? Between(new Date(startDate), new Date(endDate)) : undefined;

    const deliveredOrders = await this.ordersRepository.find({
      where: {
        order_date: orderDateRange,
        status: OrderStatus.DELIVERED,
      },
      relations: ['items'],
    });

    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = deliveredOrders.length;

    const averageRevenuePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    let totalUnitsSold = 0;
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        totalUnitsSold += item.quantity;
      });
    });

    return { averageRevenuePerOrder, totalUnitsSold };
  }

  async getInventoryMetrics(filter: DashboardFilterDto): Promise<DashboardInventoryMetricsDto> {
    const { startDate, endDate } = filter;
    const orderDateRange = startDate && endDate ? Between(new Date(startDate), new Date(endDate)) : undefined;

    const totalStockResult = await this.productsRepository.sum('stock_current', { active: true });
    const totalAvailableStock = totalStockResult || 0;

    const totalSoldUnitsResult = await this.orderItemsRepository.sum('quantity', {
      order: {
        order_date: orderDateRange,
        status: OrderStatus.DELIVERED,
      },
    });
    const totalSoldUnits = totalSoldUnitsResult || 0;

    const totalInitialStockResult = await this.productsRepository.sum('stock_current'); // Sum of current stock as a baseline
    const totalInitialStock = totalInitialStockResult || 0; // Handle nullability
    
    const percentageSold = totalInitialStock > 0 ? totalSoldUnits / totalInitialStock * 100 : 0;

    return { totalAvailableStock, percentageSold };
  }

  async getTopClients(limit: number = 5): Promise<DashboardTopClientsDto> {
    const topClientsData = await this.ordersRepository
      .createQueryBuilder('order')
      .select('client.id', 'id')
      .addSelect('client.name', 'name')
      .addSelect('SUM(order.total)', 'totalPurchased')
      .addSelect('COUNT(order.id)', 'orderCount')
      .leftJoin('order.client', 'client')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('client.id, client.name')
      .orderBy('totalPurchased', 'DESC')
      .limit(limit)
      .getRawMany();

    const topClients = topClientsData.map(data => ({
      id: data.id,
      name: data.name,
      totalPurchased: parseFloat(data.totalPurchased),
      orderCount: parseInt(data.orderCount, 10),
    }));

    return { topClients };
  }

  async getTopProducts(limit: number = 5): Promise<DashboardTopProductsDto> {
    const topProductsData = await this.orderItemsRepository
      .createQueryBuilder('orderItem')
      .select('product.id', 'id')
      .addSelect('product.sku', 'sku')
      .addSelect('product_catalog.name', 'productName')
      .addSelect('product.grind_type', 'grindType')
      .addSelect('SUM(orderItem.quantity)', 'totalSold')
      .addSelect('SUM(orderItem.subtotal)', 'totalRevenue')
      .leftJoin('orderItem.product_stock', 'product')
      .leftJoin('product.product_catalog', 'product_catalog')
      .leftJoin('orderItem.order', 'order')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('product.id, product.sku, product_catalog.name, product.grind_type')
      .orderBy('totalSold', 'DESC')
      .limit(limit)
      .getRawMany();

    const topProducts = topProductsData.map(data => ({
      id: data.id,
      sku: data.sku,
      productName: data.productName,
      grindType: data.grindType,
      totalSold: parseFloat(data.totalSold),
      totalRevenue: parseFloat(data.totalRevenue),
    }));

    return { topProducts };
  }
}
