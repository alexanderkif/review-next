'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import MultipleImageUpload from '../../components/ui/MultipleImageUpload';
import { logger } from '../../lib/logger';
import { useToast } from '../../components/ui/ToastContainer';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  ExternalLink,
  Github,
  Star,
  Calendar,
  Heart,
  MessageCircle
} from 'lucide-react';

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In Progress';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
};

interface Project {
  id: number;
  title: string;
  description: string;
  short_description: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  image_urls?: string[];
  year: number;
  featured: boolean;
  status: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export default function ProjectsEditor() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
      }
    } catch (error) {
      logger.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject({
      id: 0,
      title: '',
      description: '',
      short_description: '',
      technologies: [],
      github_url: '',
      demo_url: '',
      image_urls: [],
      year: new Date().getFullYear(),
      featured: false,
      status: 'completed',
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString()
    });
    setShowForm(true);
  };

  const handleEditProject = async (project: Project) => {
    // Load images for existing project
    const projectWithImages = { ...project };
    
    if (project.id && project.id !== 0) {
      try {
        // Load images from images table
        const response = await fetch(`/api/admin/images?entityType=project&entityId=${project.id}`);
        if (response.ok) {
          const images = await response.json();
          const imageIds = images.map((img: unknown) => String((img as { id: number | string }).id));
          
          // Use images from API if available, otherwise use image_urls from project
          if (imageIds.length > 0) {
            projectWithImages.image_urls = imageIds;
          } else if (project.image_urls && Array.isArray(project.image_urls)) {
            // Fallback to image_urls from database if no images in images table
            projectWithImages.image_urls = project.image_urls.map(id => String(id));
          }
        }
      } catch (error) {
        logger.error('Error loading project images:', error);
        // Fallback to existing image_urls
        if (project.image_urls && Array.isArray(project.image_urls)) {
          projectWithImages.image_urls = project.image_urls.map(id => String(id));
        }
      }
    }
    
    setEditingProject(projectWithImages);
    setShowForm(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;

    try {
      const isNew = editingProject.id === 0;
      const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${editingProject.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProject),
      });

      if (response.ok) {
        const result = await response.json();
        
        // If it's a new project and we have images with entityId "new",
        // update them to use the real project ID
        if (isNew && result.id && editingProject.image_urls && editingProject.image_urls.length > 0) {
          try {
            await fetch('/api/admin/images/reassign', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                entityType: 'project',
                oldEntityId: 'new',
                newEntityId: result.id.toString(),
                imageIds: editingProject.image_urls
              }),
            });

          } catch (reassignError) {
            logger.error('Error reassigning images:', reassignError);
          }
        }
        
        await fetchProjects();
        setShowForm(false);
        setEditingProject(null);
        showToast('Project saved successfully!', 'success');
      } else {
        showToast('Error saving project', 'error');
      }
    } catch (error) {
      logger.error('Error saving project:', error);
      showToast('Error saving project', 'error');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProjects();
        showToast('Project deleted successfully!', 'success');
      } else {
        showToast('Error deleting project', 'error');
      }
    } catch (error) {
      logger.error('Error deleting project:', error);
      showToast('Error deleting project', 'error');
    }
  };

  const updateProject = (field: keyof Project, value: string | string[] | number | boolean) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      [field]: value
    });
  };

  const addTechnology = () => {
    if (!editingProject) return;
    updateProject('technologies', [...editingProject.technologies, '']);
  };

  const removeTechnology = (index: number) => {
    if (!editingProject) return;
    const newTech = editingProject.technologies.filter((_, i) => i !== index);
    updateProject('technologies', newTech);
  };

  const updateTechnology = (index: number, value: string) => {
    if (!editingProject) return;
    const newTech = [...editingProject.technologies];
    newTech[index] = value;
    updateProject('technologies', newTech);
  };

  const updateProjectImages = (imageIds: string[]) => {
    if (!editingProject) return;
    updateProject('image_urls', imageIds);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Project Management</h2>
          <p className="text-slate-600">Total projects: {projects.length}</p>
        </div>
        <Button
          onClick={handleCreateProject}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      {!showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} >
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
                    <Button
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      className="p-2"
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
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
      )}

      {/* Edit Form */}
      {showForm && editingProject && (
        <Card >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {editingProject.id === 0 ? 'New Project' : 'Edit Project'}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowForm(false)}
                className="p-2"
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Title *
                </label>
                <Input
                  value={editingProject.title || ''}
                  onChange={(e) => updateProject('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year *
                </label>
                <Input
                  type="number"
                  value={editingProject.year || ''}
                  onChange={(e) => updateProject('year', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Short Description *
              </label>
              <Input
                value={editingProject.short_description || ''}
                onChange={(e) => updateProject('short_description', e.target.value)}
                placeholder="Brief project summary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Detailed Description *
              </label>
              <Textarea
                rows={4}
                value={editingProject.description || ''}
                onChange={(e) => updateProject('description', e.target.value)}
                placeholder="Detailed project description"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GitHub URL
                </label>
                <Input
                  value={editingProject.github_url || ''}
                  onChange={(e) => updateProject('github_url', e.target.value)}
                  placeholder="https://github.com/user/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Demo URL
                </label>
                <Input
                  value={editingProject.demo_url || ''}
                  onChange={(e) => updateProject('demo_url', e.target.value)}
                  placeholder="https://demo.example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={editingProject.status}
                  onChange={(e) => updateProject('status', e.target.value)}
                >
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Featured
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff] flex items-center">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProject.featured}
                        onChange={(e) => updateProject('featured', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      Mark as featured project
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">
                  Technologies
                </label>
                <Button
                  size="sm"
                  onClick={addTechnology}
                  className="text-green-600 hover:text-green-600"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {editingProject.technologies.map((tech, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tech || ''}
                      onChange={(e) => updateTechnology(index, e.target.value)}
                      placeholder="Technology name"
                    />
                    <Button
                      size="sm"
                      onClick={() => removeTechnology(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Images */}
            <div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Project Images
                </label>
                {(() => {
                  const imageUrls: string[] = Array.isArray(editingProject.image_urls) 
                    ? editingProject.image_urls.filter((id): id is string => typeof id === 'string' && id.length > 0)
                    : [];
                  const props = {
                    entityType: "project" as const,
                    entityId: editingProject.id?.toString() || 'new',
                    value: imageUrls,
                    onUpdate: updateProjectImages,
                    maxImages: 6,
                    maxSize: 3
                  };
                  return <MultipleImageUpload {...props} />;
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => setShowForm(false)}
                className="text-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProject}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Save Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
