import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import Tooltip from '../../../components/ui/Tooltip';
import { Save, Plus, Trash2, Briefcase } from 'lucide-react';
import { Experience } from './types';

interface ExperienceSectionProps {
  experience: Experience[];
  saving: boolean;
  onUpdate: (index: number, field: string, value: string | boolean) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave: () => void;
}

export default function ExperienceSection({
  experience,
  saving,
  onUpdate,
  onAdd,
  onRemove,
  onSave
}: ExperienceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase size={20} />
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {experience.map((exp, index) => (
          <div
            key={exp.id}
            className="p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl shadow-[inset_-2px_-2px_1.5px_rgba(255,255,255,0.7),inset_2px_2px_1.5px_rgba(0,0,0,0.1)] border border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Position
                </label>
                <Input
                  value={exp.title || ''}
                  onChange={(e) => onUpdate(index, 'title', e.target.value)}
                  placeholder="Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company
                </label>
                <Input
                  value={exp.company || ''}
                  onChange={(e) => onUpdate(index, 'company', e.target.value)}
                  placeholder="Tech Solutions Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Work Period
                </label>
                <Input
                  value={exp.period || ''}
                  onChange={(e) => onUpdate(index, 'period', e.target.value)}
                  placeholder={`2020 - ${new Date().getFullYear()}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.is_current}
                  onChange={(e) => onUpdate(index, 'is_current', e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <label
                  htmlFor={`current-${exp.id}`}
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  Current Position
                </label>
              </div>
            </div>
            <div className="mt-4">
              <Textarea
                value={exp.description || ''}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                placeholder="Description of responsibilities and achievements..."
                rows={3}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Tooltip content="Delete experience" position="top" variant="clay">
                <Button
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="group hover:bg-red-50 transition-all"
                  aria-label="Delete experience"
                >
                  <Trash2 size={16} className="icon-danger" />
                  <span className="icon-danger">Delete</span>
                </Button>
              </Tooltip>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <Button onClick={onAdd} className="flex items-center gap-2">
            <Plus size={16} />
            Add Work Experience
          </Button>

          <Button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
