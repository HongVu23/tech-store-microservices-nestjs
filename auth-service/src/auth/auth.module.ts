import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserServiceClientModule } from "src/rmq-client/user-service-client.module";

@Module({
    imports: [UserServiceClientModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}