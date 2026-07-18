import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { RequestWithUser } from '../../../common/interfaces/request-with-user.interface';

@Controller('auth') 
export class AuthController {
    constructor(
        private readonly authService: AuthService, 
    ) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Req() req: any) {
        return req.user;
    }

    @Post('refresh-token')
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto)
    }

    @Post('logout')
    logout(@Body() dto: RefreshTokenDto) {
        return this.authService.logout(dto)
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    logoutAll(@Req() req: RequestWithUser) {
        return this.authService.logoutAll(req.user.sub) 
    }
}