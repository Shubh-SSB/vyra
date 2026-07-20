-- CreateEnum
CREATE TYPE "MessagePrivacy" AS ENUM ('EVERYONE', 'FRIENDS_ONLY', 'NOBODY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "messagePrivacy" "MessagePrivacy" NOT NULL DEFAULT 'EVERYONE';
