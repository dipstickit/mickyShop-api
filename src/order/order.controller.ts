import { Roles } from 'src/decorator/role.decorator';
import { OrderService } from './order.service';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/enums/role.enum';
import { AccessTokenGuard } from 'src/auth/access-token.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Order } from './entities/order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(Role.Admin, Role.User, Role.Manager, Role.Employee)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}

@Controller('admin/order')
@Roles(Role.Admin, Role.Manager, Role.Employee)
@UseGuards(AccessTokenGuard, RolesGuard)
export class OrderAdminController {
  constructor(private readonly orderService: OrderService) {}

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch('update-status/:id')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('name') name = '',
  ): Promise<Pagination<Order>> {
    limit = limit > 100 ? 100 : limit;
    return this.orderService.findAll(
      {
        page,
        limit,
        route: `${process.env.SERVER}/admin/order`,
      },
      name,
    );
  }
}
