import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Save, Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordSectionProps {
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  toggleCurrentPassword: () => void;
  toggleNewPassword: () => void;
  toggleConfirmPassword: () => void;
  saving: boolean;
  onUpdate: () => void;
}

export default function PasswordSection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  toggleCurrentPassword,
  toggleNewPassword,
  toggleConfirmPassword,
  saving,
  onUpdate,
}: PasswordSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock size={20} />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
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
              onClick={toggleCurrentPassword}
              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 hover:text-slate-600"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword || ''}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              className="pr-10"
            />
            <button
              type="button"
              onClick={toggleNewPassword}
              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 hover:text-slate-600"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Confirm New Password
          </label>
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
              onClick={toggleConfirmPassword}
              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={onUpdate}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          >
            {saving ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saving ? 'Saving...' : 'Update Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
