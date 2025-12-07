import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { FilterClientDto } from './dto/filter-client.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { StatsClientDto } from './dto/stats-client.dto';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientsRepository.create(createClientDto);
    return this.clientsRepository.save(client);
  }

  async findAll(filterDto: FilterClientDto): Promise<PaginationResult<Client>> {
    const { page = 1, limit = 10, name, email, phone, district } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (name) {
      where.name = ILike(`%${name}%`);
    }
    if (email) {
      where.email = ILike(`%${email}%`);
    }
    if (phone) {
      where.phone = ILike(`%${phone}%`);
    }
    if (district) {
      where.district = ILike(`%${district}%`);
    }

    const [data, total] = await this.clientsRepository.findAndCount({
      where,
      take: limit,
      skip,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const updateResult = await this.clientsRepository.update(id, updateClientDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.clientsRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
  }

  async getStatsForClient(id: string): Promise<StatsClientDto> {
    const client = await this.findOne(id);

    const orders = await this.ordersRepository.find({
      where: { client: { id: client.id } },
      order: { created_at: 'ASC' },
    });

    if (orders.length === 0) {
      return {
        first_purchase_date: null,
        last_purchase_date: null,
        number_of_orders: 0,
        total_amount_paid: 0,
        days_without_orders: null,
        favorite_payment_method: null,
      };
    }

    const first_purchase_date = orders[0].created_at;
    const last_purchase_date = orders[orders.length - 1].created_at;
    const number_of_orders = orders.length;

    const total_amount_paid = orders
      .filter((o) => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + o.total, 0);

    const days_without_orders = Math.floor(
      (new Date().getTime() - last_purchase_date.getTime()) / (1000 * 60 * 60 * 24),
    );

    const paymentMethodCounts = orders.reduce((acc, order) => {
      acc[order.payment_method] = (acc[order.payment_method] || 0) + 1;
      return acc;
    }, {} as Record<PaymentMethod, number>);

    const favorite_payment_method = Object.keys(paymentMethodCounts).reduce(
      (a, b) => (paymentMethodCounts[a] > paymentMethodCounts[b] ? a : b),
    ) as PaymentMethod;

    return {
      first_purchase_date,
      last_purchase_date,
      number_of_orders,
      total_amount_paid,
      days_without_orders,
      favorite_payment_method,
    };
  }
}
