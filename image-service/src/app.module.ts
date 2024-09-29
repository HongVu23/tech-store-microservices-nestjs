import { Module } from '@nestjs/common';
import { ImageServiceModule } from './image-service/image-service.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ImageServiceModule
  ]
})
export class AppModule {}
