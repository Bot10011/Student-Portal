-- Create a stored procedure that can be called from the client to create the dashboard_access table
CREATE OR REPLACE FUNCTION create_dashboard_access_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN  -- Create dashboard_access table for SuperAdmin access control
  CREATE TABLE IF NOT EXISTS dashboard_access (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role TEXT NOT NULL,
    has_access BOOLEAN NOT NULL DEFAULT TRUE,
    restriction_heading TEXT NOT NULL DEFAULT 'Access Restricted',
    restriction_subtext TEXT NOT NULL DEFAULT 'Dashboard access is temporarily restricted.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  -- Insert default values for each role if table was just created
  IF (SELECT COUNT(*) FROM dashboard_access) = 0 THEN
    INSERT INTO dashboard_access (role, has_access, restriction_heading, restriction_subtext)
    VALUES 
      ('admin', true, 'Access Restricted', 'Admin dashboard is currently under maintenance.'),
      ('registrar', true, 'Access Restricted', 'Registrar dashboard is currently restricted.'),
      ('programhead', true, 'Access Restricted', 'Program Head dashboard is currently restricted.'),
      ('teacher', true, 'Access Restricted', 'Teacher dashboard is currently restricted.'),
      ('student', true, 'Access Restricted', 'Student dashboard is currently restricted.');
  END IF;

  -- Create function to update timestamp on record update
  CREATE OR REPLACE FUNCTION update_modified_column() 
  RETURNS TRIGGER AS $update_modified_column$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW; 
  END;
  $update_modified_column$ LANGUAGE plpgsql;

  -- Create trigger to update timestamp on record update if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_dashboard_access_timestamp'
  ) THEN
    CREATE TRIGGER set_dashboard_access_timestamp
    BEFORE UPDATE ON dashboard_access
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END;
$$;
