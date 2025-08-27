-- Migration script to handle existing voter data before making departmentId and courseId required
-- This script should be run before applying the schema changes

-- First, let's check if there are any voters with null departmentId or courseId
SELECT 
    COUNT(*) as total_voters,
    COUNT(departmentId) as voters_with_department,
    COUNT(courseId) as voters_with_course,
    COUNT(CASE WHEN departmentId IS NULL OR courseId IS NULL THEN 1 END) as voters_with_null_fields
FROM voters;

-- If there are voters with null values, we need to either:
-- 1. Delete them (if they're test data)
-- 2. Assign them to default department/course
-- 3. Update them with valid values

-- Option 1: Delete voters with null departmentId or courseId (use with caution)
-- DELETE FROM voters WHERE departmentId IS NULL OR courseId IS NULL;

-- Option 2: Assign default department and course (safer approach)
-- First, get the first available department and course
-- UPDATE voters 
-- SET 
--     departmentId = (SELECT id FROM departments LIMIT 1),
--     courseId = (SELECT id FROM courses LIMIT 1)
-- WHERE departmentId IS NULL OR courseId IS NULL;

-- Option 3: Check what data exists and handle accordingly
-- This is the recommended approach - review the data first

