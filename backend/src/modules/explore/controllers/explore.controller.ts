import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ExploreService } from "../services/explore.service";
import { ApiResponseUtil } from "../../../common/utils/api-response";

@Controller("explore")
@UseGuards(JwtAuthGuard)
export class ExploreController {
    constructor(private readonly exploreService: ExploreService) {}

    @Get("search")
    async search(
        @Query("q") query: string,
        @Query("type") type?: string,
    ) {
        const results = await this.exploreService.search(query, type);
        return ApiResponseUtil.success(results);
    }

    @Get("music/full-stream")
    async getFullStream(
        @Query("title") title: string,
        @Query("artist") artist: string,
    ) {
        const url = await this.exploreService.getFullMusicStream(title, artist);
        return ApiResponseUtil.success({ url });
    }
}
