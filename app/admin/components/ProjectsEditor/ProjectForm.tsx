import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import CommaSeparatedInput from '@/components/ui/CommaSeparatedInput';
import MultipleImageUpload from '@/components/ui/MultipleImageUpload';
import { Save, X } from 'lucide-react';
import { Project } from './types';

interface ProjectFormProps {
  project: Project;
  onUpdate: (field: string, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdateImages: (imageIds: string[]) => void;
}

export default function ProjectForm({
  project,
  onUpdate,
  onSave,
  onCancel,
  onUpdateImages,
}: ProjectFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{project.id === 0 ? 'New Project' : 'Edit Project'}</CardTitle>
          <Button size="sm" onClick={onCancel} className="p-2" aria-label="Close form">
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label="Project Title"
              value={project.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Year"
              type="number"
              value={project.year || ''}
              onChange={(e) => onUpdate('year', parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <Input
            label="Short Description"
            value={project.short_description || ''}
            onChange={(e) => onUpdate('short_description', e.target.value)}
            placeholder="Brief project summary"
            required
          />
        </div>

        <div>
          <Textarea
            label="Detailed Description"
            rows={4}
            value={project.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Detailed project description"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label="GitHub URL"
              value={project.github_url || ''}
              onChange={(e) => onUpdate('github_url', e.target.value)}
              placeholder="https://github.com/user/repo"
            />
          </div>

          <div>
            <Input
              label="Demo URL"
              value={project.demo_url || ''}
              onChange={(e) => onUpdate('demo_url', e.target.value)}
              placeholder="https://demo.example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="project-status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="project-status"
              aria-label="Project Status"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff] focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
              value={project.status}
              onChange={(e) => onUpdate('status', e.target.value)}
            >
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <fieldset className="min-w-0">
            <legend className="mb-2 block text-sm font-medium text-slate-700">Visibility</legend>
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff]">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={project.featured}
                  onChange={(e) => onUpdate('featured', e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                />
                <span>
                  <span className="font-medium">Mark as featured project</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Highlighted on the home page and CV.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={project.hidden}
                  onChange={(e) => onUpdate('hidden', e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                />
                <span>
                  <span className="font-medium">Hide project</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Hidden from the public Projects page and featured lists.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Technologies */}
        <CommaSeparatedInput
          label="Technologies"
          value={project.technologies || []}
          onChange={(values) => onUpdate('technologies', values)}
          placeholder="TypeScript, React, Next.js, PostgreSQL"
        />

        {/* Project Images */}
        <div>
          <div className="mb-3 text-sm font-medium text-slate-700">Project Images</div>
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
