import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserRole } from '../types/auth';
import { Users, Database, Clock, AlertTriangle } from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
}

interface UserMetric {
  role: UserRole;
  count: number;
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    databaseSize: number;
    activeUsers: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF8042'];

const SystemMonitoring: React.FC = () => {
  const { user } = useAuth();
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    lastUpdated: new Date().toISOString(),
    metrics: {
      cpuUsage: 15,
      memoryUsage: 35,
      databaseSize: 450, // MB
      activeUsers: 120,
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user counts by role
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('role, last_login');
        
        if (userError) throw userError;
        
        // Aggregate counts by role
        if (userData) {
          const roleCounts: Record<string, number> = {};
          let activeUserCount = 0;
          const now = Date.now();
          userData.forEach((item: { role: string, last_login?: string }) => {
            roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
            if (item.last_login && new Date(item.last_login).getTime() > now - 24 * 60 * 60 * 1000) {
              activeUserCount++;
            }
          });
          setUserMetrics(
            Object.entries(roleCounts).map(([role, count]) => ({
              role: role as UserRole,
              count: count as number,
            }))
          );
          setSystemMetrics([
            { name: 'Active Users (24h)', value: activeUserCount },
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching system data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling for system status updates (every 30 seconds)
    const intervalId = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
        metrics: {
          ...prev.metrics,
          cpuUsage: Math.min(100, Math.max(5, prev.metrics.cpuUsage + (Math.random() * 10 - 5))),
          memoryUsage: Math.min(100, Math.max(10, prev.metrics.memoryUsage + (Math.random() * 10 - 5))),
          activeUsers: Math.max(0, prev.metrics.activeUsers + Math.floor(Math.random() * 10 - 5)),
        }
      }));
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h1 className="text-2xl text-red-600 font-bold mb-2">Access Denied</h1>
        <p className="text-red-600">You do not have permission to access this page.</p>
      </div>
    );
  }

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">System Monitoring</h1>
      
      {loading ? (
        <div className="w-full flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-start">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users (24h)</p>
                <p className="text-2xl font-bold text-gray-800">{systemMetrics.find(m => m.name === 'Active Users (24h)')?.value ?? 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center col-span-1 md:col-span-1 lg:col-span-3">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Database & Server Metrics</h2>
              <p className="text-gray-600 mb-4 text-center">
                For live database size, CPU, and memory usage, please visit your{' '}
                <a
                  href="https://app.supabase.com/project/jtljmtljmhsiwceqrtiq/usage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Supabase Project Dashboard
                </a>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800">User Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userMetrics.map(item => ({ name: item.role, value: item.count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Metrics Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800">System Metrics (Last 24h)</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={systemMetrics}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">System Status</h2>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(systemStatus.status)}`}></span>
                <span className="capitalize font-medium">
                  {systemStatus.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Last updated: {new Date(systemStatus.lastUpdated).toLocaleString()}
            </p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => {
                // Simulating a refresh action
                setSystemStatus(prev => ({
                  ...prev,
                  lastUpdated: new Date().toISOString()
                }));
              }}
            >
              Refresh Data
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemMonitoring;
