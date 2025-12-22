-- Set admin role for configured admin emails
-- This ensures admins can access the admin portal

-- Update existing users with admin emails to have admin role
UPDATE users 
SET role = 'admin', 
    updated_at = NOW()
WHERE LOWER(email) IN ('tktoot1@yahoo.com', 'tktut1@yahoo.com')
  AND role != 'admin';

-- Log the changes
DO $$ 
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % user(s) to admin role', updated_count;
END $$;

-- Verify admin users
SELECT id, email, role, updated_at
FROM users
WHERE role = 'admin'
ORDER BY email;
