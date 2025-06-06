import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TeacherSubject {
  teacher_id: string;
  course_id: number;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  role: string;
  full_name: string;
}

interface Course {
  id: number;
  course_code: string;
  description: string;
  year_level: string;
  semester: string;
  term: string | null;
  display_name: string;
}

interface SubjectAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formErrors: Record<string, string>;
  assignment: TeacherSubject;
  handleInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  formSubmitting: boolean;
  isEditMode: boolean;
  teachers: Teacher[];
  courses: Course[];
}

const SubjectAssignmentModal: React.FC<SubjectAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formErrors,
  assignment,
  handleInputChange,
  formSubmitting,
  isEditMode,
  teachers,
  courses
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] subject-modal">
      {/* Semi-transparent overlay with enhanced blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex items-center justify-center h-full p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {isEditMode ? 'Edit Subject Assignment' : 'Assign New Subject'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={onSubmit}>
            {/* Teacher Selection */}
            <div className="mb-5">
              <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                id="teacher_id"
                name="teacher_id"
                value={assignment.teacher_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  formErrors.teacher_id 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm`}
              >
                <option value="">Select a teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name} {teacher.department ? `(${teacher.department})` : ''}
                  </option>
                ))}
              </select>
              {formErrors.teacher_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.teacher_id}</p>
              )}
            </div>
            
            {/* Course Selection */}
            <div className="mb-5">
              <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="course_id"
                name="course_id"
                value={assignment.course_id || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  formErrors.course_id 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm`}
              >
                <option value="">Select a subject</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.display_name}
                  </option>
                ))}
              </select>
              {formErrors.course_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.course_id}</p>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isEditMode ? 'Update Assignment' : 'Assign Subject'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SubjectAssignmentModal;
