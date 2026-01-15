import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import Tooltip from '../../../components/ui/Tooltip';
import { Save, Plus, Trash2, Languages as LanguagesIcon } from 'lucide-react';
import { Language } from './types';

interface LanguagesSectionProps {
  languages: Language[];
  saving: boolean;
  onUpdate: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave: () => void;
}

export default function LanguagesSection({
  languages,
  saving,
  onUpdate,
  onAdd,
  onRemove,
  onSave,
}: LanguagesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LanguagesIcon size={20} />
          Languages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {languages.map((lang, index) => (
          <div
            key={lang.id}
            className="flex items-center gap-4 rounded-xl border border-white/20 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-[inset_-2px_-2px_1.5px_rgba(255,255,255,0.7),inset_2px_2px_1.5px_rgba(0,0,0,0.1)]"
          >
            <div className="flex-1">
              <Input
                label="Language"
                value={lang.language || ''}
                onChange={(e) => onUpdate(index, 'language', e.target.value)}
                placeholder="English"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Proficiency Level"
                value={lang.level || ''}
                onChange={(e) => onUpdate(index, 'level', e.target.value)}
                placeholder="B2 (Upper-Intermediate)"
              />
            </div>
            <Tooltip content="Delete language" position="top" variant="clay">
              <Button
                size="sm"
                onClick={() => onRemove(index)}
                className="group min-h-[36px] min-w-[36px] p-2 transition-all hover:bg-red-50"
                aria-label="Delete language"
              >
                <Trash2 size={16} className="icon-danger" />
              </Button>
            </Tooltip>
          </div>
        ))}

        <div className="flex justify-between">
          <Button onClick={onAdd} className="flex items-center gap-2">
            <Plus size={16} />
            Add Language
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
