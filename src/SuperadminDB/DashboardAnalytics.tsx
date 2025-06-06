import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Clock, Calendar, BookOpen } from 'lucide-react';

interface DashboardMetric {
  name: string;
  students: number;
  teachers: number;
  registrars: number;
  programHeads: number;
}

interface PageViewMetric {
  page: string;
  views: number;
}

interface UserActivityData {
  hour: number;
  logins: number;
  pageViews: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DashboardMetric[]>([]);
  const [pageViews, setPageViews] = useState<PageViewMetric[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<UserActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // This would normally come from a backend API that tracks analytics
        // Here we're simulating it with static data for the demo
        
        // Create weekly data
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weekData = days.map(day => ({
          name: day,
          students: Math.floor(Math.random() * 100) + 50,
          teachers: Math.floor(Math.random() * 30) + 10,
          registrars: Math.floor(Math.random() * 5) + 1,
          programHeads: Math.floor(Math.random() * 7) + 3,
        }));
        setWeeklyData(weekData);

        // Create page view data
        setPageViews([
          { page: 'Dashboard', views: 1423 },
          { page: 'User Management', views: 892 },
          { page: 'Course Pages', views: 1053 },
          { page: 'Grade Views', views: 1290 },
          { page: 'Enrollment', views: 623 },
          { page: 'Settings', views: 410 },
        ]);

        // Create hourly activity data
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          logins: Math.floor(Math.random() * 30) + (i > 8 && i < 20 ? 20 : 5), // Higher during working hours
          pageViews: Math.floor(Math.random() * 120) + (i > 8 && i < 20 ? 80 : 20), // Higher during working hours
        }));
        setHourlyActivity(hourlyData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h1 className="text-2xl text-red-600 font-bold mb-2">Access Denied</h1>
        <p className="text-red-600">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Analytics</h1>
      
      {loading ? (
        <div className="w-full flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 flex items-start">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <Users className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users Today</p>
                <p className="text-2xl font-bold text-gray-800">234</p>
                <p className="text-sm text-green-500">↑ 12% from yesterday</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex items-start">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Page Views</p>
                <p className="text-2xl font-bold text-gray-800">5,721</p>
                <p className="text-sm text-green-500">↑ 8% from yesterday</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex items-start">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">New Users This Week</p>
                <p className="text-2xl font-bold text-gray-800">128</p>
                <p className="text-sm text-green-500">↑ 24% from last week</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex items-start">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Session Duration</p>
                <p className="text-2xl font-bold text-gray-800">12:45</p>
                <p className="text-sm text-red-500">↓ 3% from yesterday</p>
              </div>
            </div>
          </div>

          {/* Weekly User Activity Chart */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly User Activity</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" name="Students" />
                  <Bar dataKey="teachers" fill="#82ca9d" name="Teachers" />
                  <Bar dataKey="registrars" fill="#ffc658" name="Registrars" />
                  <Bar dataKey="programHeads" fill="#ff8042" name="Program Heads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Hourly Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800">24-Hour Activity</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={hourlyActivity}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(hour) => `Time: ${hour}:00`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="logins" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Logins"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pageViews" 
                      stroke="#82ca9d" 
                      name="Page Views"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Page Views Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Most Viewed Pages</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pageViews}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="views"
                      nameKey="page"
                    >
                      {pageViews.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} views`, props.payload.page]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Analytics Overview</h2>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Export Report
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              This dashboard shows an overview of user activity and engagement across the student portal.
              Use these insights to understand usage patterns and improve the user experience.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnalytics;
