import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CombosModule } from './combos/combos.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { DrinksModule } from './drinks/drinks.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { FilesModule } from './files/files.module.js';
import { FoodsModule } from './foods/foods.module.js';
import { HealthController } from './health.controller.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BranchesModule,
    EmployeesModule,
    CategoriesModule,
    FoodsModule,
    DrinksModule,
    CombosModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    RealtimeModule,
    DashboardModule,
    FilesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
