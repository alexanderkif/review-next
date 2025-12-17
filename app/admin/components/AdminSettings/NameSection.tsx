import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Save, User } from 'lucide-react';

interface NameSectionProps {
  currentName: string;
  name: string;
  setName: (name: string) => void;
  saving: boolean;
  onUpdate: () => void;
}

export default function NameSection({
  currentName,
  name,
  setName,
  saving,
  onUpdate,
}: NameSectionProps) {
  return (
    <Card>
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
            {currentName || 'Not set'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Name
          </label>
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
            onClick={onUpdate}
            disabled={saving || !name.trim() || name === currentName}
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
  );
}
