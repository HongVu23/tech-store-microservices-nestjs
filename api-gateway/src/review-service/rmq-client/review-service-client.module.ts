import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REVIEW_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'review-queue'
        }
      }
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: 'REVIEW_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'review-queue'
        }
      }
    ]),
  ]
})
export class ReviewServiceClientModule {}