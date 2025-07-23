-- Drop existing tables if they exist
DROP TABLE IF EXISTS document_analytics CASCADE;
DROP TABLE IF EXISTS generated_documents CASCADE;
DROP TABLE IF EXISTS job_descriptions CASCADE;
DROP TABLE IF EXISTS original_documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS saved_documents CASCADE; -- Your test table

-- Create users table (core table for authentication and billing)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    
    -- Subscription Management
    subscription_tier VARCHAR(50) DEFAULT 'FREEMIUM' CHECK (subscription_tier IN ('FREEMIUM', 'BASIC', 'PREMIUM', 'PREMIUM_PLUS')),
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    subscription_status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'canceled', 'past_due', etc.
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    
    -- Usage Tracking
    monthly_generations_used INTEGER DEFAULT 0,
    monthly_generations_limit INTEGER DEFAULT 2,
    usage_reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 month',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create generated documents table (simplified for your saved documents feature)
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Document Details
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('resume', 'cover_letter')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    -- Optional metadata (for future features)
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    generation_metadata JSONB DEFAULT '{}',
    
    -- User Actions
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Add a view for easy querying of favorited documents with full details
CREATE VIEW user_favorited_documents AS
SELECT 
    f.id as favorite_id,
    f.user_id,
    f.notes,
    f.tags,
    f.created_at as favorited_at,
    gd.id as document_id,
    gd.document_type,
    gd.title,
    gd.content,
    gd.company_name,
    gd.job_title,
    gd.generation_metadata,
    gd.download_count,
    gd.created_at as document_created_at
FROM favorited_documents f
JOIN generated_documents gd ON f.generated_document_id = gd.id
ORDER BY f.created_at DESC;



-- Create indexes for performance
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_generated_docs_user_id ON generated_documents(user_id);
CREATE INDEX idx_generated_docs_user_type ON generated_documents(user_id, document_type);
CREATE INDEX idx_generated_docs_created_at ON generated_documents(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at BEFORE UPDATE ON generated_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test user to verify everything works
-- (Replace with your actual Firebase UID after testing)
INSERT INTO users (firebase_uid, email, display_name) 
VALUES ('test-firebase-uid', 'test@example.com', 'Test User');