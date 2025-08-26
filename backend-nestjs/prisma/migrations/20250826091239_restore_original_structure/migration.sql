/*
  Warnings:

  - The primary key for the `election_candidates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `election_positions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[electionId,candidateId]` on the table `election_candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[electionId,positionId]` on the table `election_positions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voterId,electionId,positionId,candidateId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `election_candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `election_positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `electionId` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "votes_voterId_candidateId_key";

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "election_candidates" DROP CONSTRAINT "election_candidates_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" VARCHAR(50) NOT NULL,
ADD CONSTRAINT "election_candidates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "election_positions" DROP CONSTRAINT "election_positions_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" VARCHAR(50) NOT NULL,
ADD CONSTRAINT "election_positions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "elections" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "positions" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "voters" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "votes" ADD COLUMN     "auditHash" VARCHAR(255),
ADD COLUMN     "electionId" TEXT NOT NULL,
ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "positionId" TEXT NOT NULL,
ADD COLUMN     "sessionId" VARCHAR(255),
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "verificationCode" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "election_candidates_electionId_candidateId_key" ON "election_candidates"("electionId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "election_positions_electionId_positionId_key" ON "election_positions"("electionId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_voterId_electionId_positionId_candidateId_key" ON "votes"("voterId", "electionId", "positionId", "candidateId");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
