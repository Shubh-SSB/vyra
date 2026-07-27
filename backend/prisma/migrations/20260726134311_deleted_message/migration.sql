-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deleteById" TEXT,
ADD COLUMN     "restoreUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Message_conversationId_deletedAt_idx" ON "Message"("conversationId", "deletedAt");

-- CreateIndex
CREATE INDEX "Message_restoreUntil_idx" ON "Message"("restoreUntil");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_deleteById_fkey" FOREIGN KEY ("deleteById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
