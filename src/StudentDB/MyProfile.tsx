import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { motion } from 'framer-motion';
import { User, Mail, BadgeCheck, UserCircle } from 'lucide-react';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export const MyProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-red-500">Profile not found</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <UserCircle className="text-purple-500" /> My Profile
      </h2>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : profile ? (
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto transition-all border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <UserCircle className="w-14 h-14 text-purple-400 animate-pulse" />
            <div>
              <h3 className="text-xl font-semibold text-purple-700">
                {profile.first_name} {profile.middle_name ? profile.middle_name + ' ' : ''}{profile.last_name}
              </h3>
              <span className="text-xs bg-purple-100 text-purple-700 rounded px-2 py-1">{profile.role}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-5 h-5 text-gray-400" /> {profile.email}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5 text-gray-400" /> Username: {profile.username}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <BadgeCheck className="w-5 h-5 text-gray-400" />
              Status:
              <span className={
                "font-medium px-2 py-1 rounded " +
                (profile.student_status === 'regular'
                  ? 'bg-green-100 text-green-700'
                  : profile.student_status === 'irregular'
                  ? 'bg-yellow-100 text-yellow-700'
                  : profile.student_status === 'transferee'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500')
              }>
                {profile.student_status || 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <UserCircle className="w-12 h-12 text-gray-400 animate-bounce mb-2" />
          <p className="text-lg text-gray-500 font-medium">No profile data found.</p>
        </div>
      )}
    </motion.div>
  );
}; 