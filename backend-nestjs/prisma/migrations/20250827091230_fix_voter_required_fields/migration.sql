/*
  Warnings:

  - The values [SUPER_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `event_type` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `department_id` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `position_id` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `department_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `candidate_id` on the `election_candidates` table. All the data in the column will be lost.
  - You are about to drop the column `election_id` on the `election_candidates` table. All the data in the column will be lost.
  - You are about to drop the column `election_id` on the `election_positions` table. All the data in the column will be lost.
  - You are about to drop the column `position_id` on the `election_positions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `password_reset_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `display_order` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `vote_limit` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `department_id` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `has_voted` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `candidate_id` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `election_id` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `position_id` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `voter_id` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[electionId,candidateId]` on the table `election_candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[electionId,positionId]` on the table `election_positions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reset_token_email]` on the table `password_reset_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voterId,electionId,positionId,candidateId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidateId` to the `election_candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `electionId` to the `election_candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `electionId` to the `election_positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `election_positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `voters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `voters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidateId` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `electionId` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterId` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPERADMIN', 'ADMIN');
ALTER TABLE "admins" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
COMMIT;

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_course_id_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_department_id_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_position_id_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_created_by_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_department_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_created_by_fkey";

-- DropForeignKey
ALTER TABLE "election_candidates" DROP CONSTRAINT "election_candidates_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "election_candidates" DROP CONSTRAINT "election_candidates_election_id_fkey";

-- DropForeignKey
ALTER TABLE "election_positions" DROP CONSTRAINT "election_positions_election_id_fkey";

-- DropForeignKey
ALTER TABLE "election_positions" DROP CONSTRAINT "election_positions_position_id_fkey";

-- DropForeignKey
ALTER TABLE "elections" DROP CONSTRAINT "elections_created_by_fkey";

-- DropForeignKey
ALTER TABLE "voters" DROP CONSTRAINT "voters_course_id_fkey";

-- DropForeignKey
ALTER TABLE "voters" DROP CONSTRAINT "voters_department_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_election_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_position_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_voter_id_fkey";

-- DropIndex
DROP INDEX "election_candidates_election_id_candidate_id_key";

-- DropIndex
DROP INDEX "election_positions_election_id_position_id_key";

-- DropIndex
DROP INDEX "votes_voter_id_election_id_position_id_key";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "description",
DROP COLUMN "event_type",
DROP COLUMN "ip_address",
DROP COLUMN "session_id",
DROP COLUMN "user_agent",
DROP COLUMN "user_id",
ADD COLUMN     "action" VARCHAR(255) NOT NULL,
ADD COLUMN     "details" JSONB,
ADD COLUMN     "electionId" VARCHAR(50),
ADD COLUMN     "eventType" VARCHAR(50) NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "severity" VARCHAR(20) NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" VARCHAR(50);

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "course_id",
DROP COLUMN "department_id",
DROP COLUMN "position_id",
ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "positionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "created_by",
DROP COLUMN "department_id",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "created_by",
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "election_candidates" DROP COLUMN "candidate_id",
DROP COLUMN "election_id",
ADD COLUMN     "candidateId" TEXT NOT NULL,
ADD COLUMN     "electionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "election_positions" DROP COLUMN "election_id",
DROP COLUMN "position_id",
ADD COLUMN     "electionId" TEXT NOT NULL,
ADD COLUMN     "positionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "elections" DROP COLUMN "created_by",
DROP COLUMN "end_date",
DROP COLUMN "is_active",
DROP COLUMN "start_date",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP COLUMN "expires_at",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "display_order",
DROP COLUMN "vote_limit",
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voteLimit" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "voters" DROP COLUMN "course_id",
DROP COLUMN "department_id",
DROP COLUMN "has_voted",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "hasVoted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "candidate_id",
DROP COLUMN "election_id",
DROP COLUMN "position_id",
DROP COLUMN "voter_id",
ADD COLUMN     "auditHash" VARCHAR(255),
ADD COLUMN     "candidateId" TEXT NOT NULL,
ADD COLUMN     "electionId" TEXT NOT NULL,
ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "positionId" TEXT NOT NULL,
ADD COLUMN     "sessionId" VARCHAR(255),
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "verificationCode" VARCHAR(255),
ADD COLUMN     "voterId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "election_candidates_electionId_candidateId_key" ON "election_candidates"("electionId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "election_positions_electionId_positionId_key" ON "election_positions"("electionId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_reset_token_email_key" ON "password_reset_tokens"("reset_token_email");

-- CreateIndex
CREATE UNIQUE INDEX "votes_voterId_electionId_positionId_candidateId_key" ON "votes"("voterId", "electionId", "positionId", "candidateId");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "voters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
