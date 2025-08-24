-- Migration: Add Soft Delete Fields
-- This migration adds soft delete functionality to candidates, positions, departments, and courses

-- Add soft delete fields to positions table
ALTER TABLE "positions" 
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Add soft delete fields to candidates table
ALTER TABLE "candidates" 
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Add soft delete fields to departments table
ALTER TABLE "departments" 
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Add soft delete fields to courses table
ALTER TABLE "courses" 
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Create indexes for better performance on soft delete queries
CREATE INDEX "idx_positions_is_deleted" ON "positions"("is_deleted");
CREATE INDEX "idx_candidates_is_deleted" ON "candidates"("is_deleted");
CREATE INDEX "idx_departments_is_deleted" ON "departments"("is_deleted");
CREATE INDEX "idx_courses_is_deleted" ON "courses"("is_deleted");

-- Create indexes for deleted_at timestamps
CREATE INDEX "idx_positions_deleted_at" ON "positions"("deleted_at");
CREATE INDEX "idx_candidates_deleted_at" ON "candidates"("deleted_at");
CREATE INDEX "idx_departments_deleted_at" ON "departments"("deleted_at");
CREATE INDEX "idx_courses_deleted_at" ON "courses"("deleted_at");
