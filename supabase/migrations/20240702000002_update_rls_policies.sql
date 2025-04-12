-- Disable RLS for employees table to allow admin access
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Disable RLS for attendance table
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- Disable RLS for leave_requests table
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;

-- Disable RLS for shift_assignments table
ALTER TABLE shift_assignments DISABLE ROW LEVEL SECURITY;

-- Disable RLS for shifts table
ALTER TABLE shifts DISABLE ROW LEVEL SECURITY;

-- Disable RLS for freelance_projects table
ALTER TABLE freelance_projects DISABLE ROW LEVEL SECURITY;

-- Disable RLS for freelance_payments table
ALTER TABLE freelance_payments DISABLE ROW LEVEL SECURITY;

-- Disable RLS for freelance_shifts table
ALTER TABLE freelance_shifts DISABLE ROW LEVEL SECURITY;

-- Disable RLS for freelance_shift_assignments table
ALTER TABLE freelance_shift_assignments DISABLE ROW LEVEL SECURITY;
