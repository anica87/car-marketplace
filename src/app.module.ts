import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import {ListingsModule } from './listings/listings.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    ListingsModule,
    // Add CarsModule, ListingsModule, CarImagesModule, InquiriesModule,
    // FavoritesModule, TransactionsModule here as you scaffold them —
    // e.g. `nest g resource cars` follows the same pattern as UsersModule.
  ],
  controllers: [AppController],
})
export class AppModule {}
