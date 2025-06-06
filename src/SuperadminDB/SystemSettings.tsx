import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Save, RefreshCw, Info } from 'lucide-react';

interface SystemSettings {
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultTheme: 'light' | 'dark' | 'system';
  userAutoLockout: boolean;
  maxLoginAttempts: number;
  passwordExpiryDays: number;
  enableNotifications: boolean;
  dataRetentionDays: number;
}

const SuperAdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    sessionTimeoutMinutes: 30,
    maintenanceMode: false,
    maintenanceMessage: 'The system is currently undergoing maintenance. Please try again later.',
    defaultTheme: 'light',
    userAutoLockout: true,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
    enableNotifications: true,
    dataRetentionDays: 365,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setSettings(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const saveSettings = async () => {
    if (!user || user.role !== 'superadmin') {
      toast.error('You do not have permission to change these settings');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, you would save to the database
      // const { error } = await supabase.from('system_settings').upsert({ 
      //   settings: settings 
      // });
      
      // if (error) throw error;
      
      // Simulating a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">System Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">General Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sessionTimeoutMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                id="sessionTimeoutMinutes"
                name="sessionTimeoutMinutes"
                value={settings.sessionTimeoutMinutes}
                onChange={handleChange}
                min={5}
                max={180}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Time before an inactive user is automatically logged out.
              </p>
            </div>
            
            <div>
              <label htmlFor="defaultTheme" className="block text-sm font-medium text-gray-700 mb-1">
                Default Theme
              </label>
              <select
                id="defaultTheme"
                name="defaultTheme"
                value={settings.defaultTheme}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Default theme for all users (they can override this in their profile).
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Maintenance Settings</h2>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm font-medium text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              When enabled, only superadmins can access the system.
            </p>
          </div>
          
          <div>
            <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Message
            </label>
            <textarea
              id="maintenanceMessage"
              name="maintenanceMessage"
              rows={3}
              value={settings.maintenanceMessage}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Message displayed to users during maintenance mode.
            </p>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="userAutoLockout"
                  name="userAutoLockout"
                  checked={settings.userAutoLockout}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="userAutoLockout" className="ml-2 block text-sm font-medium text-gray-700">
                  Auto-lockout after failed login attempts
                </label>
              </div>
              
              <div className="mt-2">
                <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Login Attempts Before Lockout
                </label>
                <input
                  type="number"
                  id="maxLoginAttempts"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleChange}
                  min={3}
                  max={10}
                  disabled={!settings.userAutoLockout}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="passwordExpiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                Password Expiry (days)
              </label>
              <input
                type="number"
                id="passwordExpiryDays"
                name="passwordExpiryDays"
                value={settings.passwordExpiryDays}
                onChange={handleChange}
                min={0}
                max={365}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Days before users are required to change their password (0 = never expire).
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="enableNotifications"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enableNotifications" className="ml-2 block text-sm font-medium text-gray-700">
              Enable System Notifications
            </label>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                System notifications include alerts about maintenance, security issues, and system updates.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Management</h2>
          
          <div>
            <label htmlFor="dataRetentionDays" className="block text-sm font-medium text-gray-700 mb-1">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              id="dataRetentionDays"
              name="dataRetentionDays"
              value={settings.dataRetentionDays}
              onChange={handleChange}
              min={30}
              max={3650}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Days to keep audit logs and usage data before automatic deletion.
            </p>
          </div>
        </div>
        
        <div className="p-6 flex justify-end space-x-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={saveSettings}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
