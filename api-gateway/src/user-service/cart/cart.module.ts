import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { AuthModule } from "src/auth-service/auth/auth.module";
import { UserServiceClientModule } from "./rmq-client/user-service-client.module";

@Module({
    imports: [AuthModule, UserServiceClientModule],
    controllers: [CartController],
    providers: [CartService]
})
export class CartModule {}