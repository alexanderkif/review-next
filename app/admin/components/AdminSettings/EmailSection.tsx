import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Save, User, Eye, EyeOff } from 'lucide-react';

interface EmailSectionProps {
  currentEmail: string;
  email: string;
  setEmail: (email: string) => void;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  showCurrentPassword: boolean;
  toggleShowPassword: () => void;
  saving: boolean;
  onUpdate: () => void;
}

export default function EmailSection({
  currentEmail,
  email,
  setEmail,
  currentPassword,
  setCurrentPassword,
  showCurrentPassword,
  toggleShowPassword,
  saving,
  onUpdate,
}: EmailSectionProps) {
  return (
    <Card>
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
            {currentEmail}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Email
          </label>
          <Input
            type="email"
            value={email || ''}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Password (for confirmation)
          </label>
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
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={onUpdate} disabled={saving || !email || !currentPassword}>
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
  );
}
