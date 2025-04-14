-- Ensure employee_location_assignments table exists with proper columns
CREATE TABLE IF NOT EXISTS employee_location_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES geofence_locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, location_id)
);

-- Enable RLS
ALTER TABLE employee_location_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on employee_location_assignments" ON employee_location_assignments;

-- Create a policy that allows all operations
CREATE POLICY "Allow all operations on employee_location_assignments"
  ON employee_location_assignments
  USING (true)
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE employee_location_assignments;
