import { $crud } from "@/factory/crudFactory";

export type FriendRequest = {
    id: string;
    senderId: string;
    receiverId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
};

export type FriendUser = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
};

export type IncomingRequest = {
    id: string;
    sender: FriendUser;
    createdAt: string;
};

export type OutgoingRequest = {
    id: string;
    receiver: FriendUser;
    createdAt: string;
};

export type Relationship = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIENDS";

export const FriendService = {
    sendRequest(userId: string) {
        return $crud.post<FriendRequest>("friends/request", { userId });
    },

    acceptRequest(requestId: string) {
        return $crud.post<FriendRequest>("friends/accept", { requestId });
    },

    rejectRequest(requestId: string) {
        return $crud.post<FriendRequest>("friends/reject", { requestId });
    },

    cancelRequest(requestId: string) {
        return $crud.post<FriendRequest>("friends/cancel", { requestId });
    },

    getFriends() {
        return $crud.get<FriendUser[]>("friends");
    },

    getIncomingRequests() {
        return $crud.get<IncomingRequest[]>("friends/requests/incoming");
    },

    getOutgoingRequests() {
        return $crud.get<OutgoingRequest[]>("friends/requests/outgoing");
    },

    getRelationship(userId: string) {
        return $crud.get<{ relationship: Relationship }>(`friends/relationship/${userId}`);
    },
};
