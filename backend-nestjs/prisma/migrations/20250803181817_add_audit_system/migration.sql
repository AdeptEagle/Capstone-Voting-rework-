/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `password_reset_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voterId,electionId,positionId,candidateId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.

*/
-- Index already removed - using ballot system instead

-- Elections table removed - using ballot system instead

-- Positions columns already added in first migration

-- AlterTable
ALTER TABLE "votes" ADD COLUMN     "auditHash" VARCHAR(255),
ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "sessionId" VARCHAR(255),
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "verificationCode" VARCHAR(255),
ADD COLUMN     "electionId" VARCHAR(50),
ADD COLUMN     "ballotId" VARCHAR(50);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" VARCHAR(50) NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR(50),
    "action" VARCHAR(255) NOT NULL,
    "details" JSONB,
    "metadata" JSONB,
    "severity" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "electionId" VARCHAR(50),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_reset_token_email_key" ON "password_reset_tokens"("reset_token_email");

-- CreateIndex
CREATE UNIQUE INDEX "votes_voterId_positionId_candidateId_key" ON "votes"("voterId", "positionId", "candidateId");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "voters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Election foreign key removed - using ballot system instead
