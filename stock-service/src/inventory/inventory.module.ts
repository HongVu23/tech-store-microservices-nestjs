import { Module } from "@nestjs/common";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Inventory, InventorySchema } from "./schemas/inventory.schema";
import { ProductServiceClientModule } from "./rmq-client/product-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]),
        ProductServiceClientModule
    ],
    controllers: [InventoryController],
    providers: [InventoryService]
})
export class InventoryModule {}