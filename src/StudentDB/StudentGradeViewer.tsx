import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gradeService } from '../lib/services/gradeService';
import { GradeSummary } from '../types/grades';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, AlertCircle } from 'lucide-react';

export const StudentGradeViewer: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<GradeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        if (user?.id) {
          const data = await gradeService.getStudentGrades({ student_id: user.id });
          setGrades(data);
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user?.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <GraduationCap className="text-green-500" /> My Grades
      </h2>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {grades.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="w-12 h-12 text-gray-400 animate-bounce mb-2" />
              <p className="text-lg text-gray-500 font-medium">No grades available.</p>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {grades.map(grade => (
                <motion.div key={`${grade.student_id}-${grade.subject_code}`} whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-xl p-5 transition-all border border-gray-100">
                  <h3 className="text-xl font-semibold text-green-700 mb-2">{grade.subject_code}</h3>
                  <p className="text-gray-600">Grade: <span className="font-bold">{grade.final_computed_grade?.toFixed(2) || '-'}</span></p>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}; 