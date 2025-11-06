'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, User, Lock, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import { logger } from '../../lib/logger';

interface AdminUser {
  id: number;
  email: string;
  role: string;
  name: string;
}

interface AdminSettingsProps {
  user: AdminUser;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
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

  const handleUpdateName = async () => {
    if (!name || name.trim() === '') {
      alert('Enter administrator name');
      return;
    }

    if (name === user.name) {
      alert('Name has not changed');
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
        alert('Name updated successfully!');
        // Refresh page to show updated name
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert(data.error || 'Error updating name');
        setName(user.name || ''); // Reset to original
      }
    } catch (error) {
      logger.error('Error updating name:', error);
      alert('Error updating name');
      setName(user.name || ''); // Reset to original
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email || email === user.email) {
      alert('Enter new email address');
      return;
    }

    if (!currentPassword) {
      alert('Enter current password for confirmation');
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
        alert('Email successfully updated! You need to log in again.');
        // Logout after email change
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
      } else {
        alert(data.error || 'Error updating email');
      }
    } catch (error) {
      logger.error('Error updating email:', error);
      alert('Error updating email');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Fill in all fields to change password');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must contain minimum 6 characters');
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
        alert('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Error updating password');
      }
    } catch (error) {
      logger.error('Error updating password:', error);
      alert('Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const handleClearDatabase = async () => {
    const confirmed = window.confirm(
      'WARNING! This action will delete ALL data (projects, resume, comments, likes) from the database. Users will remain. This action is IRREVERSIBLE!\n\nAre you sure you want to continue?'
    );
    
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'FINAL WARNING!\n\nAre you absolutely sure you want to delete all data? Type "CLEAR" in the next dialog to confirm.'
    );
    
    if (!doubleConfirmed) return;

    const finalConfirm = window.prompt('Type "CLEAR" (uppercase) for final confirmation:');
    
    if (finalConfirm !== 'CLEAR') {
      alert('Cancelled. Invalid confirmation code.');
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
        let message = data.message + '\\n\\n';
        if (data.cleared_tables && data.cleared_tables.length > 0) {
          message += 'Cleared tables:\\n' + data.cleared_tables.join('\\n');
        }
        if (data.skipped_tables && data.skipped_tables.length > 0) {
          message += '\\n\\nSkipped tables (did not exist):\\n' + data.skipped_tables.join('\\n');
        }
        if (data.seeded_data) {
          message += '\\n\\nSeeded data:\\n';
          message += '• CV Profile: Created\\n';
          message += '• Work Experience: 3 entries\\n';
          message += '• Education: 1 entry\\n';
          message += '• Languages: 2 entries\\n';
          message += '• Sample Projects: 3 projects';
        }
        if (data.info) {
          message += '\\n\\n' + data.info;
        }
        alert(message);
        // Reload page
        window.location.reload();
      } else {
        alert(data.error || 'Error clearing database');
      }
    } catch (error) {
      logger.error('Error clearing database:', error);
      alert('Error clearing database');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Administrator Settings</h2>
      
      <div className="flex flex-col space-y-6">
        {/* Change Administrator Name */}
        <Card variant="clay">
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

            <Button
              variant="clay"
              onClick={handleUpdateName}
              disabled={saving || !name.trim() || name === user.name}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 mt-4"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {saving ? 'Saving...' : 'Update Name'}
            </Button>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card variant="clay">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              variant="clay"
              onClick={handleUpdateEmail}
              disabled={saving || !email || !currentPassword}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {saving ? 'Saving...' : 'Update Email'}
            </Button>
          </CardContent>
        </Card>

        {/* Изменение пароля */}
        <Card variant="clay">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              variant="clay"
              onClick={handleUpdatePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-green-600 text-white hover:bg-green-700 mt-4"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Lock size={16} className="mr-2" />
              )}
              {saving ? 'Saving...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card variant="clay">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">ID:</span>
                <span className="font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Name:</span>
                <span className="font-medium">{user.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Database Reset */}
        <Card variant="clay" className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                variant="clay"
                onClick={handleClearDatabase}
                disabled={clearing}
                className="bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
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
