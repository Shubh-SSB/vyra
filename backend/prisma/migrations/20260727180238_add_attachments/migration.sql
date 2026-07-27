/*
  Warnings:

  - You are about to drop the column `voiceDuration` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `voiceUrl` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('VOICE', 'IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('TEMPORARY', 'ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('READY', 'PROCESSING', 'FAILED');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "voiceDuration",
DROP COLUMN "voiceUrl",
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'TEMPORARY',
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'READY',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messageId" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_storageKey_key" ON "Attachment"("storageKey");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
