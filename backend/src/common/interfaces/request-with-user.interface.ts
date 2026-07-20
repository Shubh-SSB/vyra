import { Request } from 'express';

export interface JwtPayload {
    id: string;
    username: string;
}

export interface RequestWithUser extends Request {
    user: JwtPayload;
}