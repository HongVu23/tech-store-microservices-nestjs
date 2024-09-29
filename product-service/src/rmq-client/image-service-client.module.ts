import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IMAGE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'image-queue'
        }
      }
    ])
  ],
  exports: [
    ClientsModule.register([
      {
        name: 'IMAGE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'image-queue'
        }
      }
    ])
  ]
})
export class ImageServiceClientModule {}