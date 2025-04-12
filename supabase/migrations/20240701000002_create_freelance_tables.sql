-- Create freelance_projects table
CREATE TABLE IF NOT EXISTS freelance_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'ongoing', 'completed', 'rejected')),
  deadline DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('project', 'hourly')),
  budget TEXT NOT NULL,
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  rating INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freelance_payments table
CREATE TABLE IF NOT EXISTS freelance_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('project', 'hourly')),
  hours INTEGER,
  rate DECIMAL(10, 2),
  date DATE NOT NULL,
  rating INTEGER DEFAULT 0,
  bonus_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users_roles table (many-to-many relationship between auth.users and roles)
CREATE TABLE IF NOT EXISTS users_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES user_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Create freelance_shifts table
CREATE TABLE IF NOT EXISTS freelance_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'full', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freelance_shift_assignments table
CREATE TABLE IF NOT EXISTS freelance_shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES freelance_shifts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(freelancer_id, shift_id)
);

-- Enable row level security
ALTER TABLE freelance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_shift_assignments ENABLE ROW LEVEL SECURITY;

-- Add to realtime publication
alter publication supabase_realtime add table freelance_projects;
alter publication supabase_realtime add table freelance_payments;
alter publication supabase_realtime add table user_roles;
alter publication supabase_realtime add table users_roles;
alter publication supabase_realtime add table freelance_shifts;
alter publication supabase_realtime add table freelance_shift_assignments;
