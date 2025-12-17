'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';
import { logger } from '../../../lib/logger';
import { useToast } from '../../../components/ui/ToastContainer';
import { useConfirm } from '../../../components/ui/ConfirmProvider';
import { Project, createEmptyProject } from './types';
import ProjectsList from './ProjectsList';
import ProjectForm from './ProjectForm';

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
    setEditingProject(createEmptyProject());
    setShowForm(true);
  };

  const handleEditProject = async (project: Project) => {
    const projectWithImages = { ...project };

    if (project.id && project.id !== 0) {
      try {
        const response = await fetch(
          `/api/admin/images?entityType=project&entityId=${project.id}`
        );
        if (response.ok) {
          const images = await response.json();
          const imageIds = images.map((img: { id: number | string }) =>
            String(img.id)
          );

          if (imageIds.length > 0) {
            projectWithImages.image_urls = imageIds;
          } else if (project.image_urls && Array.isArray(project.image_urls)) {
            projectWithImages.image_urls = project.image_urls.map((id) =>
              String(id)
            );
          }
        }
      } catch (error) {
        logger.error('Error loading project images:', error);
        if (project.image_urls && Array.isArray(project.image_urls)) {
          projectWithImages.image_urls = project.image_urls.map((id) =>
            String(id)
          );
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
      const url = isNew
        ? '/api/admin/projects'
        : `/api/admin/projects/${editingProject.id}`;
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

        // Reassign images for new projects
        if (
          isNew &&
          result.id &&
          editingProject.image_urls &&
          editingProject.image_urls.length > 0
        ) {
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
                imageIds: editingProject.image_urls,
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
      message:
        'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
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

  const updateProject = (field: string, value: unknown) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      [field]: value,
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
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      {!showForm && (
        <ProjectsList
          projects={projects}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />
      )}

      {/* Edit Form */}
      {showForm && editingProject && (
        <ProjectForm
          project={editingProject}
          onUpdate={updateProject}
          onSave={handleSaveProject}
          onCancel={() => setShowForm(false)}
          onAddTechnology={addTechnology}
          onRemoveTechnology={removeTechnology}
          onUpdateTechnology={updateTechnology}
          onUpdateImages={updateProjectImages}
        />
      )}
    </div>
  );
}
