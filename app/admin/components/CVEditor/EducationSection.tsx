import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import Tooltip from '../../../components/ui/Tooltip';
import { Save, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Education } from './types';

interface EducationSectionProps {
  education: Education[];
  saving: boolean;
  onUpdate: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave: () => void;
}

export default function EducationSection({
  education,
  saving,
  onUpdate,
  onAdd,
  onRemove,
  onSave,
}: EducationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap size={20} />
          Education
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.map((edu, index) => (
          <div
            key={edu.id}
            className="rounded-xl border border-white/20 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-[inset_-2px_-2px_1.5px_rgba(255,255,255,0.7),inset_2px_2px_1.5px_rgba(0,0,0,0.1)]"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Degree"
                value={edu.degree || ''}
                onChange={(e) => onUpdate(index, 'degree', e.target.value)}
                placeholder="Bachelor of Information Technology"
              />
              <Input
                label="Institution"
                value={edu.institution || ''}
                onChange={(e) => onUpdate(index, 'institution', e.target.value)}
                placeholder="Lomonosov Moscow State University"
              />
              <Input
                label="Period"
                value={edu.period || ''}
                onChange={(e) => onUpdate(index, 'period', e.target.value)}
                placeholder={`2015 - ${new Date().getFullYear()}`}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Description"
                value={edu.description || ''}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                placeholder="Specialization, thesis, achievements..."
                rows={2}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Tooltip content="Delete education" position="top" variant="clay">
                <Button
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="group transition-all hover:bg-red-50"
                  aria-label="Delete education"
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
            Add Education
          </Button>

          <Button onClick={onSave} disabled={saving} className="flex items-center gap-2">
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
