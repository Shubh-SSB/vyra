import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Param,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { ApiResponseUtil } from "src/common/utils/api-response";
import type { RequestWithUser } from "src/common/interfaces/request-with-user.interface";

import { FriendsService } from "../services/friend.service";

import { SendFriendRequestDto } from "../dto/send-friend-request.dto";
import { AcceptFriendRequestDto } from "../dto/accept-friend-request.dto";
import { RejectFriendRequestDto } from "../dto/reject-friend-request.dto";
import { CancelFriendRequestDto } from "../dto/cancel-friend-request.dto";


@Controller("friends")
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
  ) {}

  @Post("request")
  async sendRequest(
    @Req() req: RequestWithUser,
    @Body() dto: SendFriendRequestDto,
  ) {
    const request =
      await this.friendsService.sendRequest(
        req.user.id,
        dto.userId,
      );

    return ApiResponseUtil.success(
      request,
      "Friend request sent successfully.",
    );
  }

  @Post("accept")
  async acceptRequest(
    @Req() req: RequestWithUser,
    @Body() dto: AcceptFriendRequestDto,
  ) {
    const request =
      await this.friendsService.acceptRequest(
        req.user.id,
        dto.requestId,
      );

    return ApiResponseUtil.success(
      request,
      "Friend request accepted successfully.",
    );
  }

  @Post("reject")
  async rejectRequest(
    @Req() req: RequestWithUser,
    @Body() dto: RejectFriendRequestDto,
  ) {
    const request =
      await this.friendsService.rejectRequest(
        req.user.id,
        dto.requestId,
      );

    return ApiResponseUtil.success(
      request,
      "Friend request rejected successfully.",
    );
  }

  @Post("cancel")
  async cancelRequest(
    @Req() req: RequestWithUser,
    @Body() dto: CancelFriendRequestDto,
  ) {
    const request =
      await this.friendsService.cancelRequest(
        req.user.id,
        dto.requestId,
      );

    return ApiResponseUtil.success(
      request,
      "Friend request cancelled successfully.",
    );
  }

  @Get()
  async getFriends(
    @Req() req: RequestWithUser,
  ) {
    const friends =
      await this.friendsService.getFriends(
        req.user.id,
      );

    return ApiResponseUtil.success(
      friends,
      "Friends fetched successfully.",
    );
  }

  @Get("requests/incoming")
  async getIncomingRequests(
    @Req() req: RequestWithUser,
  ) {
    const requests =
      await this.friendsService.getIncomingRequests(
        req.user.id,
      );

    return ApiResponseUtil.success(
      requests,
      "Incoming friend requests fetched successfully.",
    );
  }

  @Get("requests/outgoing")
  async getOutgoingRequests(
    @Req() req: RequestWithUser,
  ) {
    const requests =
      await this.friendsService.getOutgoingRequests(
        req.user.id,
      );

    return ApiResponseUtil.success(
      requests,
      "Outgoing friend requests fetched successfully.",
    );
  }

  @Get("relationship/:userId")
  async getRelationship(
    @Req() req: RequestWithUser,
    @Param("userId") userId: string,
  ) {
    const relationship = await this.friendsService.getRelationship(
      req.user.id,
      userId,
    );

    return ApiResponseUtil.success(
      relationship,
      "Relationship fetched successfully.",
    );
  }
}