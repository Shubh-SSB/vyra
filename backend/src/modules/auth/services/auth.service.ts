import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PasswordService } from 'src/common/services/password.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { UserMapper } from 'src/modules/users/mappers/user.mapper';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from 'src/modules/sessions/services/session.service';
import { randomUUID } from 'crypto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly passwordService: PasswordService,
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService
    ) {}

    async register(dto: RegisterDto) {

        const existingUsername = await this.usersService.findByUsername(dto.username);
        
        if (existingUsername) {
            throw new BadRequestException('Username already exists');
        }

        if (dto.email) {
            const existingEmail = await this.usersService.findByEmail(dto.email);
            
            if (existingEmail) {
                throw new BadRequestException('Email already exists');
            }
        }

        
        const passwordHash = await this.passwordService.hash(dto.password);

        const user = await this.usersService.createUser({
            username: dto.username,
            displayName: dto.displayName,
            email: dto.email,
            passwordHash: passwordHash,
        });

        return {
            message: 'User registered successfully',
            user: UserMapper.toResponse(user),
        };
    }

    private async generateAccessToken(userId: string, username: string) {
        return this.jwtService.signAsync({ sub: userId, username }, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });
    }

    private async generateRefreshToken(
        userId: string,
        sessionId: string,
    ) {
        return this.jwtService.signAsync(
            { sub: userId, sid: sessionId },
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '30d',
            }
        )
    }

    private async verifyRefreshToken(token: string) {
        return this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_REFRESH_SECRET,
        })
    }

    async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(
        dto.refreshToken,
    );

    const session = await this.sessionService.findSessionById(
        payload.sid,
    );

    if (!session) {
        throw new UnauthorizedException('Invalid session');
    }

    const isValid = await this.passwordService.verify(
        session.refreshTokenHash,
        dto.refreshToken,
    );

    if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
    }


    const user = await this.usersService.findById(payload.sub);

    if (!user) {
        throw new UnauthorizedException('User not found');
    }


    const accessToken = await this.generateAccessToken(
        payload.sub,
        payload.username,
    );

    const refreshToken = await this.generateRefreshToken(
        payload.sub,
        payload.sid,
    );

    await this.sessionService.rotateRefreshToken(
        payload.sid,
        refreshToken,
    );

    return {
        accessToken,
        refreshToken,
    };
    }

    async login(dto: LoginDto) {

        const user = await this.usersService.findByUsernameOrEmail(dto.usernameOrEmail);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.passwordService.verify(user.passwordHash!, dto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const sessionId = randomUUID();
        
        const accessToken = await this.generateAccessToken(
            user.id,
            user.username,
        );        

        const refreshToken = await this.generateRefreshToken(
            user.id,
            sessionId,
        );


        await this.sessionService.createSession({
            id: sessionId,
            userId: user.id,
            refreshToken,
        })


        return {
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: UserMapper.toResponse(user),
            
        };
    }

    async logout (dto: RefreshTokenDto) {
        const payload = await this.verifyRefreshToken(
            dto.refreshToken,
        );

        await this.sessionService.revokeSession(payload.sid)

        return {
            message: 'Logged out successfully',
        };
    }

    async logoutAll(userId: string) {
        await this.sessionService.revokeAllSessions(userId);

        return {
            message: 'Logged out from all devices',
        };
    }
}

