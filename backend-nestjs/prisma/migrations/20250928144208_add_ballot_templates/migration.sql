-- CreateTable
CREATE TABLE "ballot_templates" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_template_name" VARCHAR(255) NOT NULL,
    "ballot_template_description" TEXT,
    "ballot_template_data" JSONB NOT NULL,
    "ballot_template_is_public" BOOLEAN NOT NULL DEFAULT false,
    "ballot_template_created_by" TEXT NOT NULL,
    "ballot_template_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ballot_template_updated_at" TIMESTAMP(3) NOT NULL,
    "ballot_template_deleted_at" TIMESTAMP(3),
    "ballot_template_is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ballot_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ballot_templates" ADD CONSTRAINT "ballot_templates_ballot_template_created_by_fkey" FOREIGN KEY ("ballot_template_created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
