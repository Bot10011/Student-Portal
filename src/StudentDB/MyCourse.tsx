import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertCircle } from 'lucide-react';

interface Enrollment {
  id: string;
  subject: {
    code: string;
    name: string;
    units: number;
  };
  status: 'active' | 'completed' | 'dropped';
}

export const MyCourse: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from('enrollments')
            .select(`
              id,
              subject:subjects!inner(code, name, units),
              status
            `)
            .eq('student_id', user.id)
            .eq('status', 'active');

          if (error) throw error;
          const typedData = (data || []).map(item => ({
            id: item.id,
            subject: item.subject[0],
            status: item.status
          })) as Enrollment[];
          setEnrollments(typedData);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user?.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BookOpen className="text-blue-500" /> My Courses
      </h2>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {enrollments.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="w-12 h-12 text-gray-400 animate-bounce mb-2" />
              <p className="text-lg text-gray-500 font-medium">No active course found.</p>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <motion.div key={enrollment.id} whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-xl p-5 transition-all border border-gray-100">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">{enrollment.subject.code}</h3>
                  <p className="text-gray-600">{enrollment.subject.name}</p>
                  <div className="mt-2 text-sm text-gray-500">{enrollment.subject.units} units</div>
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {enrollment.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}; 