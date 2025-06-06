-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'registrar')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    department TEXT,
    subject TEXT,
    grade TEXT,
    student_id TEXT UNIQUE,
    registration_number TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'teacher', 'student', 'registrar')),
    CONSTRAINT valid_teacher CHECK (
        (role = 'teacher' AND department IS NOT NULL AND subject IS NOT NULL) OR
        (role != 'teacher')
    ),
    CONSTRAINT valid_student CHECK (
        (role = 'student' AND grade IS NOT NULL AND student_id IS NOT NULL) OR
        (role != 'student')
    ),
    CONSTRAINT valid_registrar CHECK (
        (role = 'registrar' AND registration_number IS NOT NULL) OR
        (role != 'registrar')
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_student_id_idx ON users(student_id);
CREATE INDEX IF NOT EXISTS users_registration_number_idx ON users(registration_number);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete users"
    ON users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, first_name, last_name, created_by)
    VALUES (
        NEW.id,
        NEW.email,
        'student', -- Default role
        '', -- Default first name
        '', -- Default last name
        NEW.id -- Created by self
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 