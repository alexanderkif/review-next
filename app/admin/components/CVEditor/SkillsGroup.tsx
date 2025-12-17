import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import Tooltip from '../../../components/ui/Tooltip';
import { Plus, Trash2 } from 'lucide-react';
import { SkillCategory } from './types';

interface SkillsGroupProps {
  label: string;
  category: SkillCategory;
  skills: string[];
  onAdd: (category: SkillCategory) => void;
  onRemove: (category: SkillCategory, index: number) => void;
  onUpdate: (category: SkillCategory, index: number, value: string) => void;
  placeholder?: string;
}

export default function SkillsGroup({
  label,
  category,
  skills,
  onAdd,
  onRemove,
  onUpdate,
  placeholder = 'Skill name'
}: SkillsGroupProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <Tooltip content={`Add ${label.toLowerCase()}`} position="top" variant="clay">
          <Button
            size="sm"
            onClick={() => onAdd(category)}
            className="group min-h-[32px] min-w-[32px]"
            aria-label={`Add ${label.toLowerCase()}`}
          >
            <Plus size={16} className="icon-success" />
          </Button>
        </Tooltip>
      </div>
      <div className="space-y-2">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={skill || ''}
              onChange={(e) => onUpdate(category, index, e.target.value)}
              placeholder={placeholder}
            />
            <Tooltip content={`Remove ${label.toLowerCase()}`} position="top" variant="clay">
              <Button
                size="sm"
                onClick={() => onRemove(category, index)}
                className="group hover:bg-red-50 transition-all p-2 min-h-[36px] min-w-[36px]"
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <Trash2 size={16} className="icon-danger" />
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
