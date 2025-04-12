-- Update attendance table to include detailed geolocation fields
ALTER TABLE IF EXISTS attendance
ADD COLUMN IF NOT EXISTS location_check_in JSONB,
ADD COLUMN IF NOT EXISTS location_check_out JSONB;

-- Add comment to explain the structure of the location fields
COMMENT ON COLUMN attendance.location_check_in IS 'JSON object containing latitude and longitude for check-in location';
COMMENT ON COLUMN attendance.location_check_out IS 'JSON object containing latitude and longitude for check-out location';

-- Enable realtime for the attendance table
alter publication supabase_realtime add table attendance;