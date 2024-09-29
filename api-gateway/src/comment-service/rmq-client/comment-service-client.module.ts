import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COMMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'comment-queue'
        }
      }
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: 'COMMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'comment-queue'
        }
      }
    ]),
  ]
})
export class CommentServiceClientModule {}