import Link from 'next/link';
import { Github, ExternalLink, MessageCircle, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import LazyImage from './ui/LazyImage';
import ProjectCardLikeButton from './ProjectCardLikeButton';
import Tooltip from './ui/Tooltip';
import type { Project } from '../lib/db';

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

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <Card
      className="animate-fade-in relative flex h-full flex-col overflow-hidden text-white"
      style={{ animationDelay: `${Math.min(index * 0.1, 0.4)}s`, contain: 'layout style paint' }}
    >
      {/* Первое изображение проекта */}
      {project.image_urls && project.image_urls.length > 0 ? (
        <Link href={`/projects/${project.id}`} className="block">
          <div className="relative h-48 overflow-hidden rounded-xl bg-white/10">
            <LazyImage
              src={project.image_urls[0]}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              priority={index < 4}
              fetchPriority={index < 4 ? 'high' : 'low'}
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-blue-600 text-4xl font-bold text-white">
                  {project.title[0]?.toUpperCase() || 'P'}
                </div>
              }
            />
          </div>
        </Link>
      ) : (
        /* Fallback для проектов без изображений */
        <Link href={`/projects/${project.id}`} className="block">
          <div className="relative flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 transition-opacity">
            <div className="text-center text-white">
              <div className="text-2xl font-bold">{project.title}</div>
            </div>
          </div>
        </Link>
      )}

      <CardHeader className="flex-shrink-0 pt-6">
        <div className="flex items-start justify-between">
          <Link href={`/projects/${project.id}`}>
            <CardTitle className="cursor-pointer text-white transition-colors hover:text-blue-300">
              {project.title}
            </CardTitle>
          </Link>
          {project.featured && <Star size={16} className="fill-yellow-400 text-yellow-400" />}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {/* Контент карточки - растягивается */}
        <div className="flex-1 space-y-4">
          {/* Полное описание с элипсисом */}
          <p className="line-clamp-3 text-sm leading-relaxed text-white/90">
            {project.description}
          </p>

          {/* Технологии */}
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech: string) => (
              <span
                key={tech}
                className="rounded-lg bg-white/20 px-2 py-1 text-xs font-medium backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>

          {/* Год и статус */}
          <div className="flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{project.year}</span>
            </div>
            <span>{getStatusLabel(project.status)}</span>
          </div>
        </div>

        {/* Действия - прибиты к низу */}
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-3">
            {project.github_url && (
              <Tooltip content="View on GitHub" position="top">
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/40 bg-gradient-to-br from-white/25 to-white/15 p-2 text-[#bfc9d6] backdrop-blur-md transition-all hover:text-[#4078c0] hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)] focus:ring-2 focus:ring-purple-500/80 focus:outline-none"
                  aria-label="View on GitHub"
                >
                  <Github size={16} />
                </a>
              </Tooltip>
            )}
            {project.demo_url && (
              <Tooltip content="Open demo" position="top">
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/40 bg-gradient-to-br from-white/25 to-white/15 p-2 text-[#bfc9d6] backdrop-blur-md transition-all hover:text-blue-700 hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)] focus:ring-2 focus:ring-blue-500/80 focus:outline-none"
                  aria-label="Open demo"
                >
                  <ExternalLink size={16} />
                </a>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ProjectCardLikeButton
              projectId={project.id}
              initialLiked={project.user_has_liked || false}
              initialCount={project.likes_count || 0}
            />

            <Tooltip content="View comments" position="top">
              <Link
                href={`/projects/${project.id}`}
                className={`flex cursor-pointer items-center gap-1 transition-colors ${
                  (project.comments_count || 0) > 0
                    ? 'text-lime-500 hover:text-lime-400'
                    : 'text-white/70 hover:text-lime-400'
                }`}
              >
                <MessageCircle
                  size={16}
                  className={`${(project.comments_count || 0) > 0 ? 'fill-lime-500' : ''}`}
                />
                <span className="text-sm">{project.comments_count || 0}</span>
              </Link>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
