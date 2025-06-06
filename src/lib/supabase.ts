import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { UserRole } from '../types/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Types for our database tables
export type User = {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'registrar';
  first_name: string;
  last_name: string;
  department?: string;
  subject?: string;
  grade?: string;
  student_id?: string;
  registration_number?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  is_active: boolean;
};

// Helper functions for user management
export const userManagement = {
  // Create a new user
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user by ID
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete user
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get users by role
  async getUsersByRole(role: User['role']) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Helper functions for common operations
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
};

// Database operations
export const db = {
  // User management
  users: {
    create: async (userData: Database['public']['Tables']['user_profiles']['Insert']) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(userData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    getByRole: async (role: UserRole) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', role);
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: Database['public']['Tables']['user_profiles']['Update']) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // New function to get or create user profile
    getOrCreateProfile: async (userId: string, email: string, defaultRole: UserRole = 'student') => {
      // First try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      // If profile exists, return it
      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);
        return existingProfile;
      }

      console.log('Creating new profile for user:', userId);
      // If no profile exists, create one
      const username = email.split('@')[0];
      const { data: createdProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId, // Explicitly set the user ID
          email,
          username,
          role: defaultRole,
          first_name: username, // Default to username, should be updated later
          last_name: '', // Should be updated later
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw createError;
      }

      console.log('Created new profile:', createdProfile);
      return createdProfile;
    }
  },

  // Enrollment management
  enrollment: {
    create: async (enrollmentData: Database['public']['Tables']['enrollments']['Insert']) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert(enrollmentData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    getByStudent: async (studentId: string) => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          subjects (*),
          grades (*)
        `)
        .eq('student_id', studentId);
      if (error) throw error;
      return data;
    }
  },

  // Grade management
  studentGrades: {
    update: async (gradeId: string, gradeData: Database['public']['Tables']['student_grades']['Update']) => {
      const { data, error } = await supabase
        .from('student_grades')
        .update(gradeData)
        .eq('id', gradeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    getByClass: async (teacherSubjectId: string) => {
      const { data, error } = await supabase
        .from('student_grades')
        .select(`
          *,
          enrollment:enrollments(
            student:user_profiles(*)
          )
        `)
        .eq('teacher_subject_id', teacherSubjectId);
      if (error) throw error;
      return data;
    }
  }
}; 