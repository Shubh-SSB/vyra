import { NotificationType } from "@prisma/client";

export class NotificationDto {
    id!: string;
    userId!: string;
    type!: NotificationType;
    title!: string;
    body!: string;
    data?: any;
    isRead!: boolean;
    groupId?: string | null;
    createdAt!: Date;
    updatedAt!: Date;
}