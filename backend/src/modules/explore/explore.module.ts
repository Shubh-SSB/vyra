import { Module } from "@nestjs/common";
import { ExploreController } from "./controllers/explore.controller";
import { ExploreService } from "./services/explore.service";

@Module({
    controllers: [ExploreController],
    providers: [ExploreService],
    exports: [ExploreService],
})
export class ExploreModule {}
