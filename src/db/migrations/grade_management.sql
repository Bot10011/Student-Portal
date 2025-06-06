-- Create grade_periods table
CREATE TABLE IF NOT EXISTS grade_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- e.g., 'Prelim', 'Midterm', 'Final'
    academic_year VARCHAR(9) NOT NULL, -- e.g., '2023-2024'
    semester VARCHAR(20) NOT NULL, -- e.g., 'First Semester', 'Second Semester'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_subjects table to track teacher assignments
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL, -- e.g., 'A', 'B', '1A', '2B'
    academic_year VARCHAR(9) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, subject_id, section, academic_year, semester)
);

-- Create student_grades table for detailed grade tracking
CREATE TABLE IF NOT EXISTS student_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    teacher_subject_id UUID NOT NULL REFERENCES teacher_subjects(id) ON DELETE CASCADE,
    grade_period_id UUID NOT NULL REFERENCES grade_periods(id) ON DELETE CASCADE,
    grade DECIMAL(5,2) CHECK (grade >= 0 AND grade <= 100),
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enrollment_id, teacher_subject_id, grade_period_id)
);

-- Create grade_approvals table for tracking grade approval workflow
CREATE TABLE IF NOT EXISTS grade_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_grade_id UUID NOT NULL REFERENCES student_grades(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES user_profiles(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_grades_enrollment ON student_grades(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_teacher_subject ON student_grades(teacher_subject_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_period ON student_grades(grade_period_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject ON teacher_subjects(subject_id);

-- Add RLS policies
ALTER TABLE grade_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_approvals ENABLE ROW LEVEL SECURITY;

-- Grade periods policies
CREATE POLICY "Grade periods are viewable by all authenticated users"
    ON grade_periods FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Grade periods are manageable by admin and registrar"
    ON grade_periods FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'registrar')
        )
    );

-- Teacher subjects policies
CREATE POLICY "Teacher subjects are viewable by all authenticated users"
    ON teacher_subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teacher subjects are manageable by admin and registrar"
    ON teacher_subjects FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'registrar')
        )
    );

-- Student grades policies
CREATE POLICY "Students can view their own grades"
    ON student_grades FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN user_profiles up ON up.id = e.student_id
            WHERE e.id = student_grades.enrollment_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Teachers can manage grades for their subjects"
    ON student_grades FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM teacher_subjects ts
            WHERE ts.id = student_grades.teacher_subject_id
            AND ts.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Program heads can view grades for their program"
    ON student_grades FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'programhead'
        )
    );

CREATE POLICY "Admin and registrar can manage all grades"
    ON student_grades FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'registrar')
        )
    );

-- Grade approvals policies
CREATE POLICY "Grade approvals are viewable by all authenticated users"
    ON grade_approvals FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Program heads can manage grade approvals"
    ON grade_approvals FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'programhead'
        )
    );

-- Create functions for grade calculations
CREATE OR REPLACE FUNCTION calculate_final_grade(enrollment_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    final_grade DECIMAL(5,2);
BEGIN
    SELECT 
        (COALESCE(prelim.grade, 0) * 0.3 + 
         COALESCE(midterm.grade, 0) * 0.3 + 
         COALESCE(final.grade, 0) * 0.4) INTO final_grade
    FROM enrollments e
    LEFT JOIN student_grades prelim ON 
        prelim.enrollment_id = e.id AND 
        prelim.grade_period_id IN (SELECT id FROM grade_periods WHERE name = 'Prelim')
    LEFT JOIN student_grades midterm ON 
        midterm.enrollment_id = e.id AND 
        midterm.grade_period_id IN (SELECT id FROM grade_periods WHERE name = 'Midterm')
    LEFT JOIN student_grades final ON 
        final.enrollment_id = e.id AND 
        final.grade_period_id IN (SELECT id FROM grade_periods WHERE name = 'Final')
    WHERE e.id = enrollment_id;
    
    RETURN final_grade;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grade_periods_updated_at
    BEFORE UPDATE ON grade_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_subjects_updated_at
    BEFORE UPDATE ON teacher_subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_grades_updated_at
    BEFORE UPDATE ON student_grades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_approvals_updated_at
    BEFORE UPDATE ON grade_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 