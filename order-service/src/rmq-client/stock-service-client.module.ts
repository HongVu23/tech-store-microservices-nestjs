import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STOCK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'stock-queue'
        }
      }
    ])
  ],
  exports: [
    ClientsModule.register([
      {
        name: 'STOCK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'stock-queue'
        }
      }
    ])
  ]
})
export class StockServiceClientModule {}