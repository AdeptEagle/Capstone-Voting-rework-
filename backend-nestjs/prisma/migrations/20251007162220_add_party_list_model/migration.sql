/*
  Warnings:

  - You are about to drop the column `party_list_name` on the `candidates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "party_list_name",
ADD COLUMN     "party_list_id" VARCHAR(50);

-- CreateTable
CREATE TABLE "party_lists" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "logo" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "party_lists_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_party_list_id_fkey" FOREIGN KEY ("party_list_id") REFERENCES "party_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
