import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Like, Raw, Repository } from 'typeorm';
import { OrderItem } from './entities/orderItem.entity';
import { HttpService } from '@nestjs/axios';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepo: Repository<OrderItem>,
    private readonly httpService: HttpService,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const { orderItems } = createOrderDto;
    const order = await this.ordersRepo.save(createOrderDto);

    const newOrderItems = orderItems.map((o) => ({ ...o, orderId: order.id }));
    await this.orderItemsRepo.save(newOrderItems);
    return order;
  }

  async findAll(
    options: IPaginationOptions,
    name: string,
  ): Promise<Pagination<Order>> {
    return paginate<Order>(this.ordersRepo, options, {
      where: [
        {
          id: Raw((alias) => `CAST(${alias} as char(20)) Like '%${name}%'`),
        },
        {
          fullName: Like(`%${name}%`),
        },
        {
          user: {
            username: Like(`%${name}%`),
          },
        },
      ],
      relations: {
        orderItems: true,
        user: true,
      },
      order: {
        updatedDate: 'DESC',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const exist = await this.ordersRepo.findOneBy({ id });
    if (!exist) {
      throw new NotFoundException('Order not found.');
    }

    const { orderItems } = updateOrderDto;
    await this.orderItemsRepo.save(orderItems);
    return this.ordersRepo.save({ id, ...updateOrderDto });
  }

  async updateOrderStatus(id: number, updateOrderStatus: UpdateOrderStatusDto) {
    const exist = await this.ordersRepo.findOneBy({ id });
    if (!exist) {
      throw new NotFoundException('Order not found.');
    }

    return this.ordersRepo.update(id, { ...updateOrderStatus });
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
