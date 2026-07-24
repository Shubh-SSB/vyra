/*
  Warnings:

  - The `profileVisibility` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `messagePrivacy` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('EVERYONE', 'FRIENDS_ONLY', 'NOBODY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "presenceVisibility" "Visibility" NOT NULL DEFAULT 'FRIENDS_ONLY',
DROP COLUMN "profileVisibility",
ADD COLUMN     "profileVisibility" "Visibility" NOT NULL DEFAULT 'EVERYONE',
DROP COLUMN "messagePrivacy",
ADD COLUMN     "messagePrivacy" "Visibility" NOT NULL DEFAULT 'EVERYONE';

-- DropEnum
DROP TYPE "MessagePrivacy";

-- DropEnum
DROP TYPE "ProfileVisibility";
