-- Create users table with organizer and billing fields
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  
  -- Role and verification
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin')),
  organizer_verified BOOLEAN DEFAULT false,
  
  -- Billing fields
  has_payment_method_on_file BOOLEAN DEFAULT false,
  billing_customer_id VARCHAR(255),
  billing_portal_url TEXT,
  
  -- Organizer details
  business_name VARCHAR(255),
  business_website VARCHAR(500),
  business_contact_phone VARCHAR(50),
  phone_number VARCHAR(50),
  phone_verified_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
