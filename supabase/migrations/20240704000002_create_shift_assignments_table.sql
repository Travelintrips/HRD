-- Create shift_assignments table
CREATE TABLE IF NOT EXISTS shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, shift_id)
);

-- Enable row level security
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
DROP POLICY IF EXISTS "Public access to shift_assignments" ON shift_assignments;
CREATE POLICY "Public access to shift_assignments"
  ON shift_assignments
  FOR ALL
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE shift_assignments;