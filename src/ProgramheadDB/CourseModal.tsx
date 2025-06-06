import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface Course {
  course_code: string;
  description: string;
  year_level: string;
  semester: string;
  term: string | null;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formErrors: {
    course_code?: string;
    description?: string;
    year_level?: string;
    semester?: string;
  };
  newCourse: Course;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  formSubmitting: boolean;
}

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formErrors,
  newCourse,
  handleInputChange,
  formSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Full screen overlay with blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Centered modal container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-40"></div>
                <Plus className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Add New Course
              </h2>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Form content */}
          <form onSubmit={onSubmit} className="space-y-6 relative">
            {/* Background gradient with proper positioning */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 rounded-3xl -z-10 opacity-50"></div>
            
            {/* Form fields container */}
            <div className="relative space-y-6">
              {/* Course Code */}
              <div className="relative">
                <label htmlFor="course_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="course_code"
                  name="course_code"
                  value={newCourse.course_code}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.course_code 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm`}
                  placeholder="Enter course code"
                />
                {formErrors.course_code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.course_code}</p>
                )}
              </div>

              {/* Course Description */}
              <div className="relative">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm`}
                  placeholder="Enter course description"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              {/* Year Level */}
              <div className="relative">
                <label htmlFor="year_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="year_level"
                  name="year_level"
                  value={newCourse.year_level}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.year_level 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm`}
                >
                  <option value="">Select Year Level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {formErrors.year_level && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.year_level}</p>
                )}
              </div>

              {/* Semester */}
              <div className="relative">
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={newCourse.semester}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    formErrors.semester 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm`}
                >
                  <option value="">Select Semester</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                </select>
                {formErrors.semester && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>
                )}
              </div>

              {/* Term (Optional) */}
              <div className="relative">
                <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
                  Term <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  id="term"
                  name="term"
                  value={newCourse.term || "None"}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                >
                  <option value="None">None</option>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="Term 4">Term 4</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={formSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-6 rounded-xl text-white font-medium shadow-lg transition-all duration-200 ${
                    formSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {formSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Adding Course...</span>
                    </div>
                  ) : (
                    'Add Course'
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default CourseModal; 