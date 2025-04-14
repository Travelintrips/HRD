-- Add document upload fields to profiles table
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS ktp_url TEXT,
ADD COLUMN IF NOT EXISTS kk_url TEXT,
ADD COLUMN IF NOT EXISTS cv_url TEXT;
