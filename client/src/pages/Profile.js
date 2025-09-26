import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, ArrowLeft, Eye, EyeOff, Settings, Bell, BellOff } from 'lucide-react';
import { authAPI } from '../utils/api';
import TinySuccessModal from '../components/TinySuccessModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Loading profile from server...');
      
      // Get token from sessionStorage
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        console.log('❌ No authentication token found');
        window.location.href = '/login';
        return;
      }
      
      // Get user data from server using the /api/auth/me endpoint
      const response = await fetch('https://aufgabenplanung.onrender.com/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Profile response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile loaded from server:', data.user);
        
        const userData = data.user;
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setEmailNotifications(userData.preferences?.emailNotifications !== false);
      } else {
        console.log('❌ Failed to load profile from server');
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
      
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      // Redirect to login if there's an error
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update profile information
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      
      // Only include password change if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      await authAPI.updateProfile(updateData);
      
      // Update local storage
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setSuccessMessage('Profile updated successfully!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSuccessMessage('Failed to update profile: ' + (error.response?.data?.message || error.message));
      setShowSuccessModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleEmailNotificationToggle = async () => {
    try {
      setSavingPreferences(true);
      
      const newEmailNotifications = !emailNotifications;
      
      await authAPI.updatePreferences({
        emailNotifications: newEmailNotifications,
        reminderTime: user.preferences?.reminderTime || '09:00',
        timezone: user.preferences?.timezone || 'UTC'
      });
      
      setEmailNotifications(newEmailNotifications);
      setSuccessMessage(`Email notifications ${newEmailNotifications ? 'enabled' : 'disabled'} successfully`);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error updating email preferences:', error);
      setSuccessMessage('Failed to update email preferences: ' + (error.response?.data?.message || error.message));
      setShowSuccessModal(true);
    } finally {
      setSavingPreferences(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="text-center">
                 <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-gray-200">
                   {console.log('User picture check:', user?.picture)}
                   {user?.picture ? (
                     <img 
                       src={user.picture} 
                       alt="Profile" 
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         console.log('Image failed to load:', user.picture);
                         e.target.style.display = 'none';
                         const fallback = e.target.nextSibling;
                         if (fallback) {
                           fallback.style.display = 'flex';
                         }
                       }}
                       onLoad={() => {
                         console.log('Image loaded successfully:', user.picture);
                       }}
                     />
                   ) : null}
                   <div className="w-full h-full bg-gradient-to-r from-blue-500 to-orange-400 flex items-center justify-center">
                     <User className="w-10 h-10 text-white" />
                   </div>
                 </div>
                 <h2 className="text-xl font-semibold text-gray-900 mb-1">{user?.name || 'User'}</h2>
                 <p className="text-gray-600 mb-4">{user?.email || 'user@example.com'}</p>
                 <div className="text-sm text-gray-500">
                   Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                 </div>
                 {user?.isGoogleUser && (
                   <div className="text-xs text-blue-600 mt-2">
                     🔗 Google Account
                   </div>
                 )}
                 
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ 
              background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #3b82f6, #f59e0b, #fbbf24, #ffffff) border-box',
              border: '3px solid transparent'
            }}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Profile' : 'Profile Information'}
                  </h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all font-medium text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                 {/* Password Section - Only show when editing and not a Google user */}
                 {isEditing && !user?.isGoogleUser && (
                   <>
                     <div className="border-t border-gray-200 pt-6">
                       <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      
                      {/* Current Password */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
                      </div>

                      {/* New Password */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                              errors.newPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter new password (optional)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                      </div>
                     </div>
                   </>
                 )}

                 {/* Google User Notice */}
                 {isEditing && user?.isGoogleUser && (
                   <div className="border-t border-gray-200 pt-6">
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 text-blue-600 mt-0.5">🔗</div>
                         <div>
                           <h4 className="text-sm font-medium text-blue-800 mb-1">Google Account</h4>
                           <p className="text-sm text-blue-700">
                             You're signed in with Google. To change your password, please visit your Google Account settings.
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
        </button>
                  </div>
                )}
              </form>
            </div>
           </div>

           {/* Email Notification Settings */}
           <div className="lg:col-span-2">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               {/* Header */}
               <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
                 {/* <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                   <Settings className="w-6 h-6 text-purple-600" />
                 </div> */}
                 {/* <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                   Notification Settings
                 </h2> */}
               </div>

               {/* Email Notifications Toggle */}
               <div className="p-4 sm:p-6">
                 <div className="border border-gray-200 rounded-lg p-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 rounded-lg">
                         {emailNotifications ? (
                           <Bell className="w-5 h-5 text-blue-600" />
                         ) : (
                           <BellOff className="w-5 h-5 text-gray-400" />
                         )}
                       </div>
                       <div>
                       <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Email Notifications</h2>
                         <p className="text-sm text-gray-600">
                           Receive email notifications for task updates, reminders, and summaries
                         </p>
                       </div>
                     </div>
                     <button
                       onClick={handleEmailNotificationToggle}
                       disabled={savingPreferences}
                       className={`
                         relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out shadow-inner
                         ${emailNotifications 
                           ? 'bg-gradient-to-r from-green-400 to-blue-500 shadow-green-200' 
                           : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-gray-200'
                         }
                         ${savingPreferences ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                       `}
                     >
                       <span
                         className={`
                           inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out
                           ${emailNotifications ? 'translate-x-6 shadow-green-300' : 'translate-x-1 shadow-gray-300'}
                         `}
                       />
                     </button>
                   </div>
                   
                   {/* Notification Types Info */}
                   {/* <div className="mt-4 pl-12">
                     <div className="text-sm text-gray-600 space-y-1">
                       <p>When enabled, you'll receive emails for:</p>
                       <ul className="list-disc list-inside ml-4 space-y-1">
                         <li>Task creation confirmations</li>
                         <li>Task completion celebrations</li>
                         <li>Daily task reminders (9 AM UTC)</li>
                         <li>Overdue task alerts (6 PM UTC)</li>
                         <li>Weekly productivity summaries (Monday 8 AM UTC)</li>
                         <li>Monthly productivity reports (1st of month 9 AM UTC)</li>
                       </ul>
                     </div>
                   </div> */}
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
       
       {/* Tiny Success Modal */}
      <TinySuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        duration={4000}
      />
    </div>
  );
};

export default Profile;
