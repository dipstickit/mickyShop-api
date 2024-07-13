import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeValueModule } from './attribute-value/attribute-value.module';
import { AttributeModule } from './attribute/attribute.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { VariantModule } from './variant/variant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_SCHEMA,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    UserModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    AttributeModule,
    AttributeValueModule,
    OrderModule,
    VariantModule,
  ],
})
export class AppModule {}
