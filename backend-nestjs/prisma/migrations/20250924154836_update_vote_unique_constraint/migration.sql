/*
  Warnings:

  - A unique constraint covering the columns `[voterId,electionId,positionId,candidateId,ballotId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "votes_voterId_electionId_positionId_candidateId_key";

-- CreateIndex
CREATE UNIQUE INDEX "votes_voterId_electionId_positionId_candidateId_ballotId_key" ON "votes"("voterId", "electionId", "positionId", "candidateId", "ballotId");
