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
import { UpdatePrivacyDto, UpdateProfileDto, UpdateUsernameDto } from "../dto/update-profile.dto";
import { SearchUserDto } from "../dto/search-user.dto";
import { UserMapper } from "../mappers/user.mapper";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Get("me")
  async me(@Req() req: RequestWithUser) {
    return ApiResponseUtil.success(
      req.user,
      "User fetched successfully",
    );
  }

  @Get("search")
  async search(
    @Req() req: RequestWithUser,
    @Query() dto: SearchUserDto,
  ) {

    const users =
      await this.usersService.search(
        req.user.id,
        dto.query,
      );

    return ApiResponseUtil.success(
      users,
      "Users fetched successfully",
    );
  }

  @Get("profile/:username")
    async findUserProfile(
      @Req() req: RequestWithUser,
      @Param("username") username: string,
    ) {
      const user = await this.usersService.findUserProfile(
        req.user.id,
        username,
      );

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
      req.user.id,
      dto,
    );

    return ApiResponseUtil.success(
      UserMapper.toResponse(user),
      "Profile updated successfully",
    );
  }

  @Patch("username")
  async updateUsername(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUsernameDto,
  ) {
    const user = await this.usersService.updateUsername(
      req.user.id,
      dto,
    );

    return ApiResponseUtil.success(
      UserMapper.toResponse(user),
      "Username updated successfully",
    );
  }

  @Get("username/:username")
  async checkUsernameAvailability(
    @Param("username") username: string,
  ) {
    const available =
      await this.usersService.isUsernameAvailable(username);

    return ApiResponseUtil.success(
      { available },
      "Username availability checked",
    );
  }

  @Patch("privacy")
  async updatePrivacy(
    @Req() req: RequestWithUser,
    @Body() dto: UpdatePrivacyDto,
  ) {
    const user =
      await this.usersService.updatePrivacy(
        req.user.id,
        dto,
      );

    return ApiResponseUtil.success(
      UserMapper.toResponse(user),
      "Privacy updated successfully",
    );
  }
}