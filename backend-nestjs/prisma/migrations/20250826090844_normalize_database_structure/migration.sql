/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `departments` table. All the data in the column will be lost.
  - The primary key for the `election_candidates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `election_candidates` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `election_candidates` table. All the data in the column will be lost.
  - The primary key for the `election_positions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `election_positions` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `election_positions` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `voters` table. All the data in the column will be lost.
  - You are about to drop the column `auditHash` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[voterId,candidateId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_electionId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_positionId_fkey";

-- DropIndex
DROP INDEX "election_candidates_electionId_candidateId_key";

-- DropIndex
DROP INDEX "election_positions_electionId_positionId_key";

-- DropIndex
DROP INDEX "votes_voterId_electionId_positionId_candidateId_key";

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "election_candidates" DROP CONSTRAINT "election_candidates_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
ADD CONSTRAINT "election_candidates_pkey" PRIMARY KEY ("electionId", "candidateId");

-- AlterTable
ALTER TABLE "election_positions" DROP CONSTRAINT "election_positions_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
ADD CONSTRAINT "election_positions_pkey" PRIMARY KEY ("electionId", "positionId");

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "voters" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "auditHash",
DROP COLUMN "electionId",
DROP COLUMN "ipAddress",
DROP COLUMN "positionId",
DROP COLUMN "sessionId",
DROP COLUMN "userAgent",
DROP COLUMN "verificationCode";

-- CreateIndex
CREATE UNIQUE INDEX "votes_voterId_candidateId_key" ON "votes"("voterId", "candidateId");
