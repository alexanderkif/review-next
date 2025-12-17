import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import { Edit3, Trash2, Star, Calendar, Heart, MessageCircle, Github, ExternalLink } from 'lucide-react';
import { Project, getStatusLabel } from './types';

interface ProjectsListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
}

export default function ProjectsList({ projects, onEdit, onDelete }: ProjectsListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.featured && (
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">
                  {project.short_description}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Tooltip content="Edit project" position="top" variant="clay">
                  <Button
                    size="sm"
                    onClick={() => onEdit(project)}
                    className="group p-2 min-h-[32px] min-w-[32px]"
                    aria-label="Edit project"
                  >
                    <Edit3 size={14} className="icon-warning" />
                  </Button>
                </Tooltip>
                <Tooltip content="Delete project" position="top" variant="clay">
                  <Button
                    size="sm"
                    onClick={() => onDelete(project.id)}
                    className="group p-2 hover:bg-red-50 transition-all min-h-[32px] min-w-[32px]"
                    aria-label="Delete project"
                  >
                    <Trash2 size={14} className="icon-danger" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg">
                    +{project.technologies.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{project.year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart size={14} />
                    <span>{project.likes_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    <span>{project.comments_count}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <Github size={14} />
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Status: {getStatusLabel(project.status)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
