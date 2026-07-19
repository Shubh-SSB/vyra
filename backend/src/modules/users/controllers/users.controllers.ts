import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { UsersService } from "../services/users.service";
import { ApiResponseUtil } from "src/common/utils/api-response";
import type { RequestWithUser } from "src/common/interfaces/request-with-user.interface";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { SearchUserDto } from "../dto/search-user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get("me")
  async me(@Req() req: RequestWithUser) {
    return ApiResponseUtil.success(
      req.user,
      "User fetched successfully",
    );
  }

  @Get("search")
  async search(
    @Query() dto: SearchUserDto,
  ) {
    const users = await this.usersService.search(dto.query);

    return ApiResponseUtil.success(
      users,
      "Users fetched successfully",
    );
  }

  @Get(":id")
  async findById(
    @Param("id") id: string,
  ) {
    const user = await this.usersService.findPublicById(id);

    return ApiResponseUtil.success(
      user,
      "User fetched successfully",
    );
  }

  @Patch("profile")
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.sub,
      dto,
    );

    return ApiResponseUtil.success(
      user,
      "Profile updated successfully",
    );
  }
}