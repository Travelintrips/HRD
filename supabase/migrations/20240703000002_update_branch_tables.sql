-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_areas table
CREATE TABLE IF NOT EXISTS work_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_places table
CREATE TABLE IF NOT EXISTS work_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_area_id UUID NOT NULL REFERENCES work_areas(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add work_place_id to branches table
ALTER TABLE branches ADD COLUMN IF NOT EXISTS work_place_id UUID REFERENCES work_places(id);

-- Enable realtime for new tables
alter publication supabase_realtime add table cities;
alter publication supabase_realtime add table work_areas;
alter publication supabase_realtime add table work_places;
