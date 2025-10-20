-- Add admin role to user with email tktoot1@yahoo.com
-- This script sets the role to 'admin' for the specified email

UPDATE users 
SET role = 'admin' 
WHERE LOWER(email) = 'tktoot1@yahoo.com';

-- Verify the update
SELECT id, email, role, created_at 
FROM users 
WHERE LOWER(email) = 'tktoot1@yahoo.com';
