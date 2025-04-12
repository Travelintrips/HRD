-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create divisions table
CREATE TABLE IF NOT EXISTS divisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employment_statuses table
CREATE TABLE IF NOT EXISTS employment_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default data for branches
INSERT INTO branches (name, code) VALUES
('Headquarters', 'HQ'),
('North Branch', 'NB'),
('South Branch', 'SB'),
('East Branch', 'EB'),
('West Branch', 'WB');

-- Insert default data for divisions
INSERT INTO divisions (name, code) VALUES
('Engineering', 'ENG'),
('Marketing', 'MKT'),
('Finance', 'FIN'),
('Human Resources', 'HR'),
('Operations', 'OPS');

-- Insert default data for employment_statuses
INSERT INTO employment_statuses (name, code) VALUES
('Permanent', 'PERM'),
('Freelance', 'FREE');

-- Enable realtime for all tables
alter publication supabase_realtime add table branches;
alter publication supabase_realtime add table divisions;
alter publication supabase_realtime add table employment_statuses;
