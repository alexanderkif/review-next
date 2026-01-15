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
          <div className="mb-1 text-sm font-medium text-slate-700">Current name</div>
          <p className="rounded bg-slate-50 p-2 text-sm text-slate-600">
            {currentName || 'Not set'}
          </p>
        </div>

        <div>
          <Input
            label="New Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Administrator Name"
            maxLength={100}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onUpdate} disabled={saving || !name.trim() || name === currentName}>
            {saving ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
