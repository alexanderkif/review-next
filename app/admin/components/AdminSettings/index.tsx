'use client';

import { useState } from 'react';
import { logger } from '../../../lib/logger';
import { useToast } from '../../../components/ui/ToastContainer';
import { useConfirm } from '../../../components/ui/ConfirmProvider';
import { AdminSettingsProps } from './types';
import NameSection from './NameSection';
import EmailSection from './EmailSection';
import PasswordSection from './PasswordSection';
import DangerZone from './DangerZone';

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
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showToast(data.error || 'Error updating name', 'error');
        setName(user.name || '');
      }
    } catch (error) {
      logger.error('Error updating name:', error);
      showToast('Error updating name', 'error');
      setName(user.name || '');
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
      message:
        'This action will delete images that are not associated with any existing projects or CV. This action is irreversible! Do you want to continue?',
      confirmText: 'Yes, Clean',
      cancelText: 'Cancel',
      type: 'warning',
    });

    if (!confirmed) return;

    setCleaningImages(true);
    try {
      const response = await fetch('/api/admin/clean-unused-images', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          `Successfully cleaned! Deleted: ${data.deletedCount || 0} images`,
          'success'
        );
      } else {
        showToast(data.error || 'Error cleaning images', 'error');
      }
    } catch (error) {
      logger.error('Error cleaning unused images:', error);
      showToast('Error cleaning images', 'error');
    } finally {
      setCleaningImages(false);
    }
  };

  const handleClearDatabase = async () => {
    const confirmed = await confirm({
      title: 'ATTENTION: Database Reset',
      message:
        'This will DELETE ALL DATA from the database (CV, projects, experience, education, languages, comments, likes, activity) EXCEPT admin users! A sample database will be created with test data. Are you absolutely sure?',
      confirmText: 'I Understand',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    const doubleConfirmed = await confirm({
      title: 'FINAL CONFIRMATION',
      message:
        'Last chance! This action CANNOT be undone. All your CV, projects and other data will be PERMANENTLY DELETED!',
      confirmText: 'I Understand',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!doubleConfirmed) return;

    const finalConfirm = window.prompt(
      'Type "CLEAR" (uppercase) for final confirmation:'
    );

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
          message +=
            '\n\nSkipped tables (did not exist):\n' +
            data.skipped_tables.join('\n');
        }
        if (data.seeded_data) {
          message += '\n\nSeeded data created successfully.';
        }
        if (data.info) {
          message += '\n\n' + data.info;
        }
        showToast(message, 'success', 10000);
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
        <NameSection
          currentName={user.name}
          name={name}
          setName={setName}
          saving={saving}
          onUpdate={handleUpdateName}
        />

        <EmailSection
          currentEmail={user.email}
          email={email}
          setEmail={setEmail}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          showCurrentPassword={showCurrentPassword}
          toggleShowPassword={() => setShowCurrentPassword(!showCurrentPassword)}
          saving={saving}
          onUpdate={handleUpdateEmail}
        />

        <PasswordSection
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          toggleCurrentPassword={() => setShowCurrentPassword(!showCurrentPassword)}
          toggleNewPassword={() => setShowNewPassword(!showNewPassword)}
          toggleConfirmPassword={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          saving={saving}
          onUpdate={handleUpdatePassword}
        />

        <DangerZone
          cleaningImages={cleaningImages}
          clearing={clearing}
          onCleanImages={handleCleanUnusedImages}
          onClearDatabase={handleClearDatabase}
        />
      </div>
    </div>
  );
}
