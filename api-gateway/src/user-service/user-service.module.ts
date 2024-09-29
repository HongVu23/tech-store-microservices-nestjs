import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { CartModule } from "./cart/cart.module";
import { FavoriteProductsModule } from "./favorite-products/favorite-products.module";

@Module({
    imports: [UsersModule, CartModule, FavoriteProductsModule]
})
export class UserServiceModule {}