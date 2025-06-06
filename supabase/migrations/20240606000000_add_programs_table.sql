-- Creates the programs table
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,  -- e.g., BSIT, BEED, BSED
  name VARCHAR(100) NOT NULL,       -- e.g., Bachelor of Science in Information Technology
  description TEXT,
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_programs_code ON programs(code);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_set_programs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_programs_timestamp
BEFORE UPDATE ON programs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_programs_timestamp();

-- Add program_id column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS program_id INT REFERENCES programs(id);

-- Create index for program_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_program_id ON user_profiles(program_id);

-- Insert initial programs
INSERT INTO programs (code, name, description, department)
VALUES 
  ('BSIT', 'Bachelor of Science in Information Technology', 'Computer Science and Information Technology', 'College of Computer Studies'),
  ('BSCS', 'Bachelor of Science in Computer Science', 'Computer Science and Information Technology', 'College of Computer Studies'),
  ('BEED', 'Bachelor of Elementary Education', 'Teacher Education', 'College of Education'),
  ('BSED', 'Bachelor of Secondary Education', 'Teacher Education', 'College of Education'),
  ('BSA', 'Bachelor of Science in Accountancy', 'Accounting', 'College of Business Administration'),
  ('BSBA', 'Bachelor of Science in Business Administration', 'Business Management', 'College of Business Administration')
ON CONFLICT (code) DO NOTHING;

-- Create policy for program heads to see only users in their program
CREATE POLICY "Program heads can view users in their program"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'programhead'
            AND up.program_id = user_profiles.program_id
        )
    );

-- Create policy for teachers to see only students in their program
CREATE POLICY "Teachers can view students in their program"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'teacher'
            AND up.program_id = user_profiles.program_id
            AND user_profiles.role = 'student'
        )
        OR user_profiles.id = auth.uid()
    );