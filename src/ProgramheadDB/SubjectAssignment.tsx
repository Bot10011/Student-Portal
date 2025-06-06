import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useModal } from '../contexts/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, AlertCircle, FileEdit, Trash2 } from 'lucide-react';
import SubjectAssignmentModal from './SubjectAssignmentModal';

interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  units: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TeacherSubject {
  id?: string;
  teacher_id: string;
  subject_id: string;
  section: string;
  academic_year: string;
  semester: string;
  is_active: boolean;
  created_at?: string;
  teacher_name?: string;
  subject_code?: string;
  subject_name?: string;
  subject_description?: string;
  subject_units?: number;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
}

interface Course {
  id: number;
  course_code: string;
  description: string;
  year_level: string;
  semester: string;
  term: string | null;
}

const SubjectAssignment: React.FC = () => {
  const { isModalOpen, closeModal, openModal } = useModal();
  const [assignments, setAssignments] = useState<TeacherSubject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherSubject | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [newAssignment, setNewAssignment] = useState<TeacherSubject>({
    teacher_id: '',
    subject_id: '',
    section: '',
    academic_year: '',
    semester: '',
    is_active: true
  });

  // Fetch assignments, teachers, and courses on component mount
  useEffect(() => {
    Promise.all([
      fetchAssignments(),
      fetchTeachers(),
      fetchCourses()
    ]);
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('teacher_subjects')
        .select(`
          id,
          teacher_id,
          subject_id,
          section,
          academic_year,
          semester,
          is_active,
          created_at,
          subject:subjects (
            code,
            name,
            description,
            units
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (assignmentsError) throw assignmentsError;

      // Then get the related teacher data
      const formattedData = await Promise.all(
        assignmentsData.map(async (item) => {
          // Get teacher data
          const { data: teacherData, error: teacherError } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', item.teacher_id)
            .single();

          if (teacherError) throw teacherError;

          return {
            id: item.id,
            teacher_id: item.teacher_id,
            subject_id: item.subject_id,
            section: item.section,
            academic_year: item.academic_year,
            semester: item.semester,
            is_active: item.is_active,
            created_at: item.created_at,
            teacher_name: `${teacherData.first_name} ${teacherData.last_name}`,
            subject_code: item.subject.code,
            subject_name: item.subject.name,
            subject_description: item.subject.description,
            subject_units: item.subject.units
          };
        })
      );

      setAssignments(formattedData);
    } catch (error: any) {
      console.error('Error fetching assignments:', error.message);
      showNotification('Failed to load subject assignments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          department,
          is_active
        `)
        .eq('role', 'teacher')
        .eq('is_active', true)
        .order('last_name', { ascending: true });
      
      if (error) throw error;

      // Filter out any invalid data and format teacher names
      const validTeachers = (data || [])
        .filter(teacher => teacher.first_name && teacher.last_name)
        .map(teacher => ({
          ...teacher,
          full_name: `${teacher.first_name} ${teacher.last_name}`
        }));

      setTeachers(validTeachers);
    } catch (error: any) {
      console.error('Error fetching teachers:', error.message);
      showNotification('Failed to load teachers list. Please try again.', 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          id,
          code,
          name,
          description,
          units
        `)
        .order('code', { ascending: true });
      
      if (error) throw error;

      // Filter out any invalid data and format subject information
      const validSubjects = (data || [])
        .filter(subject => subject.code && subject.name)
        .map(subject => ({
          ...subject,
          display_name: `${subject.code} - ${subject.name} (${subject.units} units)`
        }));

      setCourses(validSubjects);
    } catch (error: any) {
      console.error('Error fetching subjects:', error.message);
      showNotification('Failed to load subjects list. Please try again.', 'error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: name === 'course_id' ? parseInt(value) : value
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newAssignment.teacher_id) {
      errors.teacher_id = 'Please select a teacher';
    }
    
    if (!newAssignment.subject_id) {
      errors.subject_id = 'Please select a subject';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormSubmitting(true);
    
    try {
      let result;
      
      if (isEditMode && selectedAssignment?.id) {
        // Update existing assignment
        result = await supabase
          .from('teacher_subjects')
          .update({
            teacher_id: newAssignment.teacher_id,
            subject_id: newAssignment.subject_id,
            section: newAssignment.section,
            academic_year: newAssignment.academic_year,
            semester: newAssignment.semester,
            is_active: true
          })
          .eq('id', selectedAssignment.id);
          
        if (result.error) throw result.error;
        showNotification('Subject assignment updated successfully', 'success');
      } else {
        // Create new assignment
        result = await supabase
          .from('teacher_subjects')
          .insert([{
            teacher_id: newAssignment.teacher_id,
            subject_id: newAssignment.subject_id,
            section: newAssignment.section,
            academic_year: newAssignment.academic_year,
            semester: newAssignment.semester,
            is_active: true
          }]);
          
        if (result.error) throw result.error;
        showNotification('Subject assigned successfully', 'success');
      }
      
      // Reset form and refresh data
      resetForm();
      fetchAssignments();
    } catch (error: any) {
      console.error('Error submitting assignment:', error.message);
      showNotification(
        `Failed to ${isEditMode ? 'update' : 'create'} subject assignment: ${error.message}`, 
        'error'
      );
    } finally {
      setFormSubmitting(false);
      closeModal();
    }
  };

  const handleEditAssignment = (assignment: TeacherSubject) => {
    setSelectedAssignment(assignment);
    setNewAssignment({
      teacher_id: assignment.teacher_id,
      subject_id: assignment.subject_id,
      section: assignment.section,
      academic_year: assignment.academic_year,
      semester: assignment.semester,
      is_active: assignment.is_active
    });
    setIsEditMode(true);
    openModal('subject');
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject assignment?')) {
      try {
        const { error } = await supabase
          .from('teacher_subjects')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        showNotification('Subject assignment deleted successfully', 'success');
        fetchAssignments();
      } catch (error: any) {
        console.error('Error deleting assignment:', error.message);
        showNotification(`Failed to delete subject assignment: ${error.message}`, 'error');
      }
    }
  };

  const resetForm = () => {
    setNewAssignment({
      teacher_id: '',
      subject_id: '',
      section: '',
      academic_year: '',
      semester: '',
      is_active: true
    });
    setFormErrors({});
    setIsEditMode(false);
    setSelectedAssignment(null);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });

    // Hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleOpenModal = () => {
    resetForm();
    openModal('subject');
  };

  return (
    <div className="py-8 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Subject Assignment</h1>
            <p className="text-gray-600">Assign subjects to teachers for effective course management</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenModal}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <Plus size={18} />
            <span>Assign Subject</span>
          </motion.button>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {notification.type === 'success' ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <AlertCircle size={20} className="text-red-600" />
              )}
              <span>{notification.message}</span>
              <button 
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="ml-auto"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assignments Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Assigned
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading subject assignments...
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      No subject assignments found. Click "Assign Subject" to create one.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignment.teacher_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.subject_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {assignment.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.subject_units}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.academic_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assignment.created_at || '').toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditAssignment(assignment)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                          >
                            <FileEdit size={18} />
                          </button>
                          <button
                            onClick={() => assignment.id && handleDeleteAssignment(assignment.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Modal for adding/editing assignments */}
      <SubjectAssignmentModal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          resetForm();
        }}
        onSubmit={handleAssignmentSubmit}
        formErrors={formErrors}
        assignment={newAssignment}
        handleInputChange={handleInputChange}
        formSubmitting={formSubmitting}
        isEditMode={isEditMode}
        teachers={teachers}
        courses={courses}
      />
    </div>
  );
};

export default SubjectAssignment;
