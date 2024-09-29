import { Module } from '@nestjs/common';
import { UserServiceModule } from './user-service/user-service.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthServiceModule } from './auth-service/auth-service.module';
import { ProductServiceModule } from './product-service/product-service.module';
import { OrderServiceModule } from './order-service/order-service.module';
import { CommentServiceModule } from './comment-service/comment-service.module';
import { ReviewServiceModule } from './review-service/review-service.module';

@Module({
  imports: [
    UserServiceModule,
    AuthServiceModule,
    ProductServiceModule,
    OrderServiceModule,
    CommentServiceModule,
    ReviewServiceModule,
    ServeStaticModule.forRoot(
      { rootPath: join(__dirname, '..', '..', 'image-service', 'public') }
    )
  ],
})
export class AppModule {}
