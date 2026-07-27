-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "forwardedFromId" TEXT,
ADD COLUMN     "isForwarded" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_forwardedFromId_fkey" FOREIGN KEY ("forwardedFromId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
