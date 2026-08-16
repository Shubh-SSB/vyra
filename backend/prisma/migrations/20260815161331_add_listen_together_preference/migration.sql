-- CreateEnum
CREATE TYPE "ListenTogetherPreference" AS ENUM ('ALWAYS', 'CHAT_ONLY', 'NEVER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "listenTogetherPreference" "ListenTogetherPreference" NOT NULL DEFAULT 'ALWAYS';
