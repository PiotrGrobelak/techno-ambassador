-- Remove foreign key constraint and set default UUID generation
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
