-- Creates the courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  year_level VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  term VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Sample data (optional, comment out if not needed)
INSERT INTO courses (course_code, description, year_level, semester, term)
VALUES 
  ('IT 101', 'Introduction to Computing', '1st Year', '1st Semester', 'Term 1'),
  ('IT 102', 'Computer Programming 1', '1st Year', '1st Semester', 'Term 2'),
  ('IT 103', 'Computer Programming 2', '1st Year', '2nd Semester', 'Term 1'),
  ('IT 201', 'Data Structures and Algorithms', '2nd Year', '1st Semester', NULL),
  ('IT 202', 'Web Development', '2nd Year', '1st Semester', NULL),
  ('IT 301', 'Database Management Systems', '3rd Year', '1st Semester', NULL),
  ('IT 401', 'Capstone Project 1', '4th Year', '1st Semester', NULL),
  ('IT 402', 'Capstone Project 2', '4th Year', '2nd Semester', NULL);
