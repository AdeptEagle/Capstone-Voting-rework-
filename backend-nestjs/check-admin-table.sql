-- Check the actual structure of the admins table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' 
AND table_schema = 'public'
ORDER BY ordinal_position;

