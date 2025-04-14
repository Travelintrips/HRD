-- Create a new junction table for employee-location assignments
CREATE TABLE IF NOT EXISTS employee_location_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  location_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, location_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES geofence_locations(id) ON DELETE CASCADE
);

-- Add realtime support
alter publication supabase_realtime add table employee_location_assignments;
