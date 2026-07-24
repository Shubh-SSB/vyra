import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { RequestWithUser } from '../../../common/interfaces/request-with-user.interface';
import { ApiResponseUtil } from 'src/common/utils/api-response';
import { UsersService } from '../../users/services/users.service';
import { UserMapper } from '../../users/mappers/user.mapper';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const result = await this.authService.register(dto);

        return ApiResponseUtil.success(
            result,
            "User registered successfully",
        );
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const result = await this.authService.login(dto);

        return ApiResponseUtil.success(
            result,
            "Login successful",
        );
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req: any) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return ApiResponseUtil.success(
            UserMapper.toResponse(user),
            "User fetched successfully",
        );
    }

    @Post('refresh-token')
    async refresh(@Body() dto: RefreshTokenDto) {
        const result = await this.authService.refresh(dto);

        return ApiResponseUtil.success(
            result,
            "Token refreshed",
        );
    }

    @Post('logout')
    logout(@Body() dto: RefreshTokenDto) {
        this.authService.logout(dto);

        return ApiResponseUtil.success(
            null,
            "Logged out successfully",
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    logoutAll(@Req() req: RequestWithUser) {
        this.authService.logoutAll(req.user.id);

        return ApiResponseUtil.success(
            null,
            "Logged out from all devices",
        );
    }
}