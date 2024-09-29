import { Module } from '@nestjs/common';
import { InventoryModule } from './inventory/inventory.module';
import { ImportedProductsModule } from './imported-products/imported-products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    InventoryModule, 
    ImportedProductsModule
  ]
})
export class AppModule {}
