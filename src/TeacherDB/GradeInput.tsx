import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dialog } from '@headlessui/react';
import { Loader2, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface GradeInputModalProps {
  open: boolean;
  onClose: () => void;
  student: any;
  classId: string;
  onGradeSaved: () => void;
}

const GradeInputModal: React.FC<GradeInputModalProps> = ({ open, onClose, student, classId, onGradeSaved }) => {
  const [grade, setGrade] = useState<number | ''>(student?.grade ?? '');
  const [loading, setLoading] = useState(false);

  if (!open || !student) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grade === '' || isNaN(Number(grade))) {
      toast.error('Please enter a valid grade.');
      return;
    }
    setLoading(true);
    // Update grade in enrollments table (replace with your logic)
    const { error } = await supabase
      .from('enrollments')
      .update({ grade: Number(grade) })
      .eq('student_id', student.id)
      .eq('subject_id', classId);
    setLoading(false);
    if (error) {
      toast.error('Failed to save grade: ' + error.message);
    } else {
      toast.success('Grade saved!');
      onGradeSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-auto z-10">
        <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100" onClick={onClose}>
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <Dialog.Title className="text-lg font-bold mb-2 flex items-center gap-2">
          <CheckCircle2 className="text-green-600" /> Grade Input
        </Dialog.Title>
        <div className="mb-4">
          <div className="font-medium text-gray-800">{student.first_name} {student.last_name}</div>
          <div className="text-sm text-gray-500">{student.email}</div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={grade}
              onChange={e => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save Grade'}
          </button>
        </form>
      </div>
    </Dialog>
  );
};

const dummyStudents = [
  { id: 'student1', first_name: 'test', last_name: 'test', email: 'john.doe@smcbi.edu.ph', grade: 85 },
  { id: 'student2', first_name: 'test', last_name: 'test', email: 'jane.smith@smcbi.edu.ph', grade: 92 },
];

const GradeInput: React.FC = () => {
  const [students, setStudents] = useState(dummyStudents);

  const handleGradeChange = (id: string, newGrade: number) => {
    setStudents(students => students.map(s => s.id === id ? { ...s, grade: newGrade } : s));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Grade Input (Demo)</h1>
      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{student.first_name} {student.last_name}</td>
              <td className="px-4 py-2">{student.email}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.grade}
                  onChange={e => handleGradeChange(student.id, Number(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradeInput; 