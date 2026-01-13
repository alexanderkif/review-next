import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import MultipleImageUpload from '../../../components/ui/MultipleImageUpload';
import Tooltip from '../../../components/ui/Tooltip';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { Project } from './types';

interface ProjectFormProps {
  project: Project;
  onUpdate: (field: string, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
  onAddTechnology: () => void;
  onRemoveTechnology: (index: number) => void;
  onUpdateTechnology: (index: number, value: string) => void;
  onUpdateImages: (imageIds: string[]) => void;
}

export default function ProjectForm({
  project,
  onUpdate,
  onSave,
  onCancel,
  onAddTechnology,
  onRemoveTechnology,
  onUpdateTechnology,
  onUpdateImages,
}: ProjectFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{project.id === 0 ? 'New Project' : 'Edit Project'}</CardTitle>
          <Button size="sm" onClick={onCancel} className="p-2">
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Project Title *</label>
            <Input
              value={project.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Year *</label>
            <Input
              type="number"
              value={project.year || ''}
              onChange={(e) => onUpdate('year', parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Short Description *
          </label>
          <Input
            value={project.short_description || ''}
            onChange={(e) => onUpdate('short_description', e.target.value)}
            placeholder="Brief project summary"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Detailed Description *
          </label>
          <Textarea
            rows={4}
            value={project.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Detailed project description"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">GitHub URL</label>
            <Input
              value={project.github_url || ''}
              onChange={(e) => onUpdate('github_url', e.target.value)}
              placeholder="https://github.com/user/repo"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Demo URL</label>
            <Input
              value={project.demo_url || ''}
              onChange={(e) => onUpdate('demo_url', e.target.value)}
              placeholder="https://demo.example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff] focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              value={project.status}
              onChange={(e) => onUpdate('status', e.target.value)}
            >
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-slate-700">Featured</label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff]">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(e) => onUpdate('featured', e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-emerald-500"
                  />
                  Mark as featured project
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Technologies */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Technologies</label>
            <Tooltip content="Add technology" position="top" variant="clay">
              <Button
                size="sm"
                onClick={onAddTechnology}
                className="group min-h-[32px] min-w-[32px]"
                aria-label="Add technology"
              >
                <Plus size={16} className="icon-success" />
              </Button>
            </Tooltip>
          </div>
          <div className="space-y-2">
            {project.technologies.map((tech, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={tech || ''}
                  onChange={(e) => onUpdateTechnology(index, e.target.value)}
                  placeholder="Technology name"
                />
                <Tooltip content="Remove technology" position="top" variant="clay">
                  <Button
                    size="sm"
                    onClick={() => onRemoveTechnology(index)}
                    className="group min-h-[36px] min-w-[36px] p-2 transition-all hover:bg-red-50"
                    aria-label="Remove technology"
                  >
                    <Trash2 size={16} className="icon-danger" />
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>

        {/* Project Images */}
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">Project Images</label>
          <MultipleImageUpload
            entityType="project"
            entityId={project.id?.toString() || 'new'}
            value={
              Array.isArray(project.image_urls)
                ? project.image_urls.filter(
                    (id): id is string => typeof id === 'string' && id.length > 0,
                  )
                : []
            }
            onUpdate={onUpdateImages}
            maxImages={6}
            maxSize={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onCancel} className="text-slate-600">
            Cancel
          </Button>
          <Button onClick={onSave} className="flex items-center gap-2">
            <Save size={16} />
            Save Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
