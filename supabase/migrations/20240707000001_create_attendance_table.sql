-- Create attendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'late', 'absent', 'leave')),
  location_check_in JSONB,
  location_check_out JSONB,
  selfie_check_in TEXT,
  selfie_check_out TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS attendance_employee_id_idx ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance(date);
CREATE INDEX IF NOT EXISTS attendance_status_idx ON attendance(status);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
