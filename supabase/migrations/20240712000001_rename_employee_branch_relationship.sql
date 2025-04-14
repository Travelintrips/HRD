-- Rename the relationship between employees and branches for clarity
-- First, identify the existing foreign key constraints
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Get the name of the first foreign key constraint from employees to branches
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'employees'::regclass
    AND confrelid = 'branches'::regclass
    LIMIT 1;
    
    -- If a constraint exists, rename it to be more descriptive
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE employees RENAME CONSTRAINT ' || constraint_name || ' TO fk_employee_main_branch';
    END IF;
END $$;

-- Add a comment to the branch_id column for better documentation
COMMENT ON COLUMN employees.branch_id IS 'Reference to the main branch where the employee is assigned';

-- Enable realtime for the employees table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'employees'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE employees;
    END IF;
END $$;
