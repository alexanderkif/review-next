import { notFound } from 'next/navigation';
import { auth } from '../../../auth';
import { 
  Calendar,
  Star,
  ArrowLeft,
  User
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { getProjectById, getProjectComments } from '../../lib/db';
import { ProjectImageCarousel, LikeButton } from '../../components';
import LazyProjectComments from '../../components/LazyProjectComments';
import ProjectActionButtons from './components/ProjectActionButtons';
import { getCVData } from '../../lib/cv-service';
import type { Metadata } from 'next';

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

export const revalidate = 900; // Cache for 15 minutes

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const projectId = parseInt(id);
  
  if (isNaN(projectId)) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  const project = await getProjectById(projectId);
  const cvData = await getCVData();
  
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  const developerName = cvData?.personalInfo?.name || 'Developer';
  
  return {
    title: `${project.title} - ${developerName}`,
    description: project.short_description || project.description?.substring(0, 160) || 'Project details',
    keywords: [
      project.title?.toLowerCase(),
      'project',
      'portfolio',
      developerName?.toLowerCase(),
      ...project.technologies.map((tech: string) => tech.toLowerCase())
    ].filter(Boolean).join(', '),
    authors: [{ name: developerName }],
    openGraph: {
      title: project.title,
      description: project.short_description || 'Professional development project',
      type: 'article',
      publishedTime: project.created_at,
      authors: [developerName],
      tags: project.technologies,
    },
  };
}

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const projectId = parseInt(id);
  
  if (isNaN(projectId)) {
    notFound();
  }

  // Получаем сессию для проверки лайков пользователя
  const session = await auth();
  const userId = session?.user?.id;
  
  const project = await getProjectById(projectId, userId);
  
  if (!project) {
    notFound();
  }

  const comments = await getProjectComments(projectId);

  return (
    <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back navigation */}
          <div className="mb-8">
            <Link 
              href="/projects"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors min-h-[44px] py-2 px-1"
            >
              <ArrowLeft size={18} />
              Back to Projects
            </Link>
          </div>

          {/* Main information */}
          <Card className="text-white mb-8 animate-fade-in">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <CardTitle className="text-3xl text-white">
                      {project.title}
                    </CardTitle>
                    {project.featured && (
                      <Star size={20} className="text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <p className="text-white/80 text-lg">
                    {project.short_description}
                  </p>
                </div>
                
                <ProjectActionButtons 
                  githubUrl={project.github_url}
                  demoUrl={project.demo_url}
                />
              </div>

              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{project.year}</span>
                </div>
                <span>{getStatusLabel(project.status)}</span>
                <div className="flex items-center gap-4">
                  <LikeButton 
                    projectId={project.id}
                    initialLiked={project.user_has_liked || false}
                    initialCount={project.likes_count || 0}
                  />
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{comments.length} comments</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Images */}
          {project.image_urls && project.image_urls.length > 0 && (
            <Card className="mb-8 animate-fade-in">
              <CardContent className="p-0">
                <ProjectImageCarousel 
                  images={project.image_urls.map(uuid => `/api/images/${uuid}`)}
                  title={project.title}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Описание */}
              <Card className="text-white animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-white">Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </CardContent>
              </Card>

              {/* Comments */}
              <LazyProjectComments 
                projectId={project.id}
                comments={comments}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Технологии */}
              <Card className="text-white animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string, index: number) => (
                      <span 
                        key={`tech-${tech}-${index}`}
                        className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Статистика */}
              <Card className="text-white animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Likes</span>
                    <span className="font-semibold">{project.likes_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Comments</span>
                    <span className="font-semibold">{project.comments_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Year</span>
                    <span className="font-semibold">{project.year}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Status</span>
                    <span className="font-semibold">{getStatusLabel(project.status)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}