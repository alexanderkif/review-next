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
  onSave
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
            className="p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl shadow-[inset_-2px_-2px_1.5px_rgba(255,255,255,0.7),inset_2px_2px_1.5px_rgba(0,0,0,0.1)] border border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={edu.degree || ''}
                onChange={(e) => onUpdate(index, 'degree', e.target.value)}
                placeholder="Bachelor of Information Technology"
              />
              <Input
                value={edu.institution || ''}
                onChange={(e) => onUpdate(index, 'institution', e.target.value)}
                placeholder="Lomonosov Moscow State University"
              />
              <Input
                value={edu.period || ''}
                onChange={(e) => onUpdate(index, 'period', e.target.value)}
                placeholder={`2015 - ${new Date().getFullYear()}`}
              />
            </div>
            <div className="mt-4">
              <Textarea
                value={edu.description || ''}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                placeholder="Specialization, thesis, achievements..."
                rows={2}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Tooltip content="Delete education" position="top" variant="clay">
                <Button
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="group hover:bg-red-50 transition-all"
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
