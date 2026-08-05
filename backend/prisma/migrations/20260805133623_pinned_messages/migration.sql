-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinnedById" TEXT,
ADD COLUMN     "pinnedDuration" TIMESTAMP(3);
