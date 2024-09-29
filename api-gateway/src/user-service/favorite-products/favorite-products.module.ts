import { Module } from "@nestjs/common";
import { UserServiceClientModule } from "./rmq-client/user-service-client.module";
import { FavoriteProductsController } from "./favorite-products.controller";
import { FavoriteProductsService } from "./favorite-products.service";
import { AuthModule } from "src/auth-service/auth/auth.module";

@Module({
    imports: [UserServiceClientModule, AuthModule],
    controllers: [FavoriteProductsController],
    providers: [FavoriteProductsService]
})
export class FavoriteProductsModule {}