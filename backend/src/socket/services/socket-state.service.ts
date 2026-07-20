import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class SocketStateService {

    private readonly users = new Map<string, Socket>();

    addUser(userId: string, socket: Socket) {
        this.users.set(userId, socket);
    }

    removeUser(userId: string) {
        this.users.delete(userId);
    }

    getUser(userId: string) {
        return this.users.get(userId);
    }

    getAllUsers() {
        return this.users;
    }
}