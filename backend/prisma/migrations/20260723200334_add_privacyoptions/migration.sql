/*
  Warnings:

  - The `presenceVisibility` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileVisibility` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `messagePrivacy` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MessagePrivacy" AS ENUM ('EVERYONE', 'FRIENDS_ONLY', 'NOBODY');

-- CreateEnum
CREATE TYPE "PresenceVisibility" AS ENUM ('EVERYONE', 'FRIENDS_ONLY', 'NOBODY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeen" TIMESTAMP(3),
ADD COLUMN     "showLastSeen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showReadReceipts" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "presenceVisibility",
ADD COLUMN     "presenceVisibility" "PresenceVisibility" NOT NULL DEFAULT 'FRIENDS_ONLY',
DROP COLUMN "profileVisibility",
ADD COLUMN     "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
DROP COLUMN "messagePrivacy",
ADD COLUMN     "messagePrivacy" "MessagePrivacy" NOT NULL DEFAULT 'EVERYONE';

-- DropEnum
DROP TYPE "Visibility";
