/*
  Warnings:

  - You are about to drop the column `lastMesssageAt` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "lastMesssageAt",
ADD COLUMN     "lastMessageAt" TIMESTAMP(3);
