import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UserServiceClientModule } from "../cart/rmq-client/user-service-client.module";
import { AuthModule } from "src/auth-service/auth/auth.module";

@Module({
    imports: [UserServiceClientModule, AuthModule],
    controllers: [UsersController],
    providers: [UsersService]
})
export class UsersModule { }