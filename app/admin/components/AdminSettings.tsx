'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, User, Lock, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import { logger } from '../../lib/logger';
import { useToast } from '../../components/ui/ToastContainer';
import { useConfirm } from '../../components/ui/ConfirmProvider';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AdminSettingsProps {
  user: AdminUser;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cleaningImages, setCleaningImages] = useState(false);

  const handleUpdateName = async () => {
    if (!name || name.trim() === '') {
      showToast('Enter administrator name', 'warning');
      return;
    }

    if (name === user.name) {
      showToast('Name has not changed', 'info');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_name',
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Name updated successfully!', 'success');
        // Refresh page to show updated name
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showToast(data.error || 'Error updating name', 'error');
        setName(user.name || ''); // Reset to original
      }
    } catch (error) {
      logger.error('Error updating name:', error);
      showToast('Error updating name', 'error');
      setName(user.name || ''); // Reset to original
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email || email === user.email) {
      showToast('Enter new email address', 'warning');
      return;
    }

    if (!currentPassword) {
      showToast('Enter current password for confirmation', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_email',
          email,
          currentPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Email successfully updated! You need to log in again.', 'success');
        // Logout after email change
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
      } else {
        showToast(data.error || 'Error updating email', 'error');
      }
    } catch (error) {
      logger.error('Error updating email:', error);
      showToast('Error updating email', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Fill in all fields to change password', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must contain minimum 6 characters', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Error updating password', 'error');
      }
    } catch (error) {
      logger.error('Error updating password:', error);
      showToast('Error updating password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCleanUnusedImages = async () => {
    const confirmed = await confirm({
      title: 'Clean Unused Images',
      message: 'This action will delete images that are not associated with any existing projects or CV. This action is irreversible! Do you want to continue?',
      confirmText: 'Yes, Clean',
      cancelText: 'Cancel',
      type: 'warning'
    });
    
    if (!confirmed) {
      return;
    }

    setCleaningImages(true);
    try {
      const response = await fetch('/api/admin/clean-unused-images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        logger.info('Unused images cleaned:', data.deleted);
      } else {
        showToast(data.error || 'Error cleaning unused images', 'error');
      }
    } catch (error) {
      logger.error('Error cleaning unused images:', error);
      showToast('Error cleaning unused images', 'error');
    } finally {
      setCleaningImages(false);
    }
  };

  const handleClearDatabase = async () => {
    // First confirmation
    const confirmed = await confirm({
      title: 'WARNING: Clear Database',
      message: 'This action will delete ALL data (projects, resume, comments, likes) from the database. Users will remain. This action is IRREVERSIBLE! Are you sure you want to continue?',
      confirmText: 'Yes, Continue',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (!confirmed) {
      return;
    }

    // Second confirmation
    const doubleConfirmed = await confirm({
      title: 'FINAL WARNING',
      message: 'Are you absolutely sure you want to delete all data? You will need to type CLEAR in the next step to confirm.',
      confirmText: 'I Understand',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (!doubleConfirmed) {
      return;
    }

    // Final typed confirmation
    const finalConfirm = window.prompt('Type "CLEAR" (uppercase) for final confirmation:');
    
    if (finalConfirm !== 'CLEAR') {
      showToast('Cancelled. Invalid confirmation code.', 'info');
      return;
    }

    setClearing(true);
    try {
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        let message = data.message + '\n\n';
        if (data.cleared_tables && data.cleared_tables.length > 0) {
          message += 'Cleared tables:\n' + data.cleared_tables.join('\n');
        }
        if (data.skipped_tables && data.skipped_tables.length > 0) {
          message += '\n\nSkipped tables (did not exist):\n' + data.skipped_tables.join('\n');
        }
        if (data.seeded_data) {
          message += '\n\nSeeded data:\n';
          message += '• CV Profile: Created\n';
          message += '• Work Experience: 3 entries\n';
          message += '• Education: 1 entry\n';
          message += '• Languages: 2 entries\n';
          message += '• Sample Projects: 3 projects';
        }
        if (data.info) {
          message += '\n\n' + data.info;
        }
        showToast(message, 'success', 10000);
        // Reload page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showToast(data.error || 'Error clearing database', 'error');
      }
    } catch (error) {
      logger.error('Error clearing database:', error);
      showToast('Error clearing database', 'error');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Administrator Settings</h2>
      
      <div className="flex flex-col space-y-6">
        {/* Change Administrator Name */}
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Administrator Name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current name
                </label>
                <p className="text-slate-600 text-sm bg-slate-50 p-2 rounded">
                  {user.name || 'Not set'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Administrator Name"
                  maxLength={100}
                />
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={handleUpdateName}
                disabled={saving || !name.trim() || name === user.name}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {saving ? 'Saving...' : 'Update Name'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Change Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current email
                </label>
                <p className="text-slate-600 text-sm bg-slate-50 p-2 rounded">
                  {user.email}
                </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Email</label>
              <Input
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password (for confirmation)</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword || ''}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={handleUpdateEmail}
                disabled={saving || !email || !currentPassword}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {saving ? 'Saving...' : 'Update Email'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Изменение пароля */}
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword || ''}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword || ''}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword || ''}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={handleUpdatePassword}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Lock size={16} className="mr-2" />
                )}
                {saving ? 'Saving...' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card >
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">ID:</span>
                <span className="font-medium text-slate-800">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Name:</span>
                <span className="font-medium text-slate-800">{user.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium text-slate-800">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Role:</span>
                <span className="font-medium capitalize text-slate-800">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Database Reset */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Clean Unused Images */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Clean Unused Images</h4>
              <p className="text-sm text-yellow-700 mb-4">
                This action will delete images that are not associated with any existing projects or CV. 
                This helps free up database space. This action is irreversible!
              </p>
              <ul className="text-sm text-yellow-600 mb-4 ml-4 list-disc">
                <li>Orphaned project images (project was deleted but images remain)</li>
                <li>Orphaned avatar images (CV was deleted but images remain)</li>
              </ul>
              
              <Button
                onClick={handleCleanUnusedImages}
                disabled={cleaningImages}
                className="bg-yellow-600 text-white hover:text-white hover:bg-yellow-500 border-yellow-600 hover:border-yellow-500 transition-all"
              >
                {cleaningImages ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                {cleaningImages ? 'Cleaning...' : 'Clean Unused Images'}
              </Button>
            </div>

            {/* Database Reset */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Database Reset</h4>
              <p className="text-sm text-red-700 mb-4">
                This action will delete ALL data from the database (projects, resume, comments, likes). 
                Users will remain untouched. This action is irreversible!
              </p>
              <ul className="text-sm text-red-600 mb-4 ml-4 list-disc">
                <li>All projects and their data</li>
                <li>All resume information</li>
                <li>All comments and likes</li>
                <li>Activity history</li>
              </ul>
              
              <Button
                onClick={handleClearDatabase}
                disabled={clearing}
                className="bg-red-600 text-white hover:text-white hover:bg-red-500 border-red-600 hover:border-red-500 transition-all"
              >
                {clearing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                {clearing ? 'Clearing...' : 'Clear Database'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
