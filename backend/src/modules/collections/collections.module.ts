import { Module } from "@nestjs/common";
import { CollectionController } from "./controllers/collection.controller";
import { CollectionService } from "./services/collection.service";
import { CollectionRepository } from "./repositories/collection.repository";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [CollectionController],
    providers: [CollectionService, CollectionRepository],
    exports: [CollectionService],
})
export class CollectionsModule {}
