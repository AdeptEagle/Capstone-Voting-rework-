/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `password_reset_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voterId,electionId,positionId,candidateId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "votes_voterId_electionId_positionId_key";

-- AlterTable
ALTER TABLE "elections" ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "positions" ADD COLUMN     "voteLimit" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "votes" ADD COLUMN     "auditHash" VARCHAR(255),
ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "sessionId" VARCHAR(255),
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "verificationCode" VARCHAR(255);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" VARCHAR(50) NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR(50),
    "electionId" VARCHAR(50),
    "action" VARCHAR(255) NOT NULL,
    "details" JSONB,
    "metadata" JSONB,
    "severity" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_email_key" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "votes_voterId_electionId_positionId_candidateId_key" ON "votes"("voterId", "electionId", "positionId", "candidateId");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "voters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
