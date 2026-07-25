import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class SocketStateService {

    private readonly users = new Map<string, Set<Socket>>();

    addUser(userId: string, socket: Socket) {
        if (!this.users.has(userId)) {
            this.users.set(userId, new Set());
        }
        this.users.get(userId)!.add(socket);
    }

    removeUser(userId: string, socket: Socket) {
        const userSockets = this.users.get(userId);
        if (userSockets) {
            userSockets.delete(socket);
            if (userSockets.size === 0) {
                this.users.delete(userId);
            }
        }
    }

    getUser(userId: string) {
        const sockets = this.users.get(userId);
        return sockets && sockets.size > 0 ? Array.from(sockets)[0] : undefined;
    }

    getAllUsers() {
        // Return a map of userId to any of their sockets (for backwards compatibility/inspection if needed)
        const activeUsers = new Map<string, Socket>();
        for (const [userId, sockets] of this.users.entries()) {
            if (sockets.size > 0) {
                activeUsers.set(userId, Array.from(sockets)[0]);
            }
        }
        return activeUsers;
    }
}