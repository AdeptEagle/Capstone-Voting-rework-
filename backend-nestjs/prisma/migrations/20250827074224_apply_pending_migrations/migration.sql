/*
  Warnings:

  - The values [SUPERADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `action` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `candidateId` on the `election_candidates` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `election_candidates` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `election_positions` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `election_positions` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `password_reset_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `voteLimit` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `hasVoted` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `auditHash` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `candidateId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `voterId` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[election_id,candidate_id]` on the table `election_candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[election_id,position_id]` on the table `election_positions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voter_id,election_id,position_id]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_type` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_id` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department_id` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidate_id` to the `election_candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `election_id` to the `election_candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `election_id` to the `election_positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_id` to the `election_positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidate_id` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `election_id` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_id` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voter_id` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'SUPER_ADMIN');
ALTER TABLE "admins" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
COMMIT;

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_electionId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_courseId_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_positionId_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "election_candidates" DROP CONSTRAINT "election_candidates_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "election_candidates" DROP CONSTRAINT "election_candidates_electionId_fkey";

-- DropForeignKey
ALTER TABLE "election_positions" DROP CONSTRAINT "election_positions_electionId_fkey";

-- DropForeignKey
ALTER TABLE "election_positions" DROP CONSTRAINT "election_positions_positionId_fkey";

-- DropForeignKey
ALTER TABLE "elections" DROP CONSTRAINT "elections_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "voters" DROP CONSTRAINT "voters_courseId_fkey";

-- DropForeignKey
ALTER TABLE "voters" DROP CONSTRAINT "voters_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_electionId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_positionId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_voterId_fkey";

-- DropIndex
DROP INDEX "election_candidates_electionId_candidateId_key";

-- DropIndex
DROP INDEX "election_positions_electionId_positionId_key";

-- DropIndex
DROP INDEX "password_reset_tokens_reset_token_email_key";

-- DropIndex
DROP INDEX "votes_voterId_electionId_positionId_candidateId_key";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "action",
DROP COLUMN "details",
DROP COLUMN "electionId",
DROP COLUMN "eventType",
DROP COLUMN "metadata",
DROP COLUMN "severity",
DROP COLUMN "timestamp",
DROP COLUMN "userId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "event_type" VARCHAR(100) NOT NULL,
ADD COLUMN     "ip_address" VARCHAR(45),
ADD COLUMN     "session_id" TEXT,
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "courseId",
DROP COLUMN "departmentId",
DROP COLUMN "positionId",
ADD COLUMN     "course_id" TEXT,
ADD COLUMN     "department_id" TEXT,
ADD COLUMN     "position_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "createdBy",
DROP COLUMN "departmentId",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "department_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "createdBy",
ADD COLUMN     "created_by" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "election_candidates" DROP COLUMN "candidateId",
DROP COLUMN "electionId",
ADD COLUMN     "candidate_id" TEXT NOT NULL,
ADD COLUMN     "election_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "election_positions" DROP COLUMN "electionId",
DROP COLUMN "positionId",
ADD COLUMN     "election_id" TEXT NOT NULL,
ADD COLUMN     "position_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "elections" DROP COLUMN "createdBy",
DROP COLUMN "endDate",
DROP COLUMN "isActive",
DROP COLUMN "startDate",
DROP COLUMN "status",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP COLUMN "expiresAt",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "displayOrder",
DROP COLUMN "voteLimit",
ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vote_limit" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "voters" DROP COLUMN "courseId",
DROP COLUMN "departmentId",
DROP COLUMN "hasVoted",
ADD COLUMN     "course_id" TEXT,
ADD COLUMN     "department_id" TEXT,
ADD COLUMN     "has_voted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "auditHash",
DROP COLUMN "candidateId",
DROP COLUMN "electionId",
DROP COLUMN "ipAddress",
DROP COLUMN "positionId",
DROP COLUMN "sessionId",
DROP COLUMN "userAgent",
DROP COLUMN "verificationCode",
DROP COLUMN "voterId",
ADD COLUMN     "candidate_id" TEXT NOT NULL,
ADD COLUMN     "election_id" TEXT NOT NULL,
ADD COLUMN     "position_id" TEXT NOT NULL,
ADD COLUMN     "voter_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "election_candidates_election_id_candidate_id_key" ON "election_candidates"("election_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "election_positions_election_id_position_id_key" ON "election_positions"("election_id", "position_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_voter_id_election_id_position_id_key" ON "votes"("voter_id", "election_id", "position_id");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "voters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "voters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
