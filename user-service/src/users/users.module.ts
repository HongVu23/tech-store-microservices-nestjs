import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthServiceClientModule } from "./rmq-client/auth-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AuthServiceClientModule
    ],
    controllers: [UsersController],
    providers: [UsersService]
})
export class UsersModule {}