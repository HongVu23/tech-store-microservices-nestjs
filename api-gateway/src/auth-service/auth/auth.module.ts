import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthServiceClientModule } from "../rmq-client/auth-service-client.module";
import { AuthGuard } from "./guards/auth.guard";

@Module({
    imports: [AuthServiceClientModule],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard,AuthServiceClientModule],
    exports: [AuthServiceClientModule]
})
export class AuthModule {}