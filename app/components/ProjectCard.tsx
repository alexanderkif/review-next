'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Github, 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  Calendar,
  Star
} from 'lucide-react';
import { logger } from '../lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import LazyImage from './ui/LazyImage';
import { toggleProjectLike } from '../lib/actions';
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
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLiked, setIsLiked] = useState(project.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    // Проверяем авторизацию
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    
    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    
    try {
      const result = await toggleProjectLike(project.id, session.user.id);
      
      if (!result.success) {
        // Revert on error
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      logger.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      variant="glass" 
      className="animate-fade-in text-white relative overflow-hidden flex flex-col h-full"
      style={{ animationDelay: `${Math.min(index * 0.1, 0.4)}s`, contain: 'layout style paint' }}
    >
      {/* Первое изображение проекта */}
      {(project.image_urls && project.image_urls.length > 0) ? (
        <Link href={`/projects/${project.id}`} className="block">
          <div className="relative rounded-xl overflow-hidden bg-white/10 h-48">
            <LazyImage
              src={project.image_urls[0]}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={index < 4}
              fetchPriority={index < 4 ? 'high' : 'low'}
              fallback={
                <div className="bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold text-4xl w-full h-full">
                  {project.title[0]?.toUpperCase() || 'P'}
                </div>
              }
            />
          </div>
        </Link>
      ) : (
        /* Fallback для проектов без изображений */
        <Link href={`/projects/${project.id}`} className="block">
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 h-48 flex items-center justify-center transition-opacity cursor-pointer">
            <div className="text-center text-white">
              <div className="text-2xl font-bold">{project.title}</div>
            </div>
          </div>
        </Link>
      )}

      <CardHeader className="flex-shrink-0 pt-6">
        <div className="flex justify-between items-start">
          <Link href={`/projects/${project.id}`}>
            <CardTitle className="text-white hover:text-blue-300 transition-colors cursor-pointer">
              {project.title}
            </CardTitle>
          </Link>
          {project.featured && (
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Контент карточки - растягивается */}
        <div className="flex-1 space-y-4">

          {/* Полное описание с элипсисом */}
          <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
            {project.description}
          </p>

          {/* Технологии */}
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech: string) => (
              <span 
                key={tech}
                className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-medium">
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
        <div className="flex justify-between items-center pt-4 mt-auto border-t border-white/10">
          <div className="flex gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md border border-white/40 text-[#bfc9d6] hover:text-blue-700 hover:from-white/30 hover:to-white/20 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/80"
                title="View on GitHub"
                aria-label="View on GitHub"
              >
                <Github size={16} />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md border border-white/40 text-[#bfc9d6] hover:text-blue-700 hover:from-white/30 hover:to-white/20 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/80"
                title="Open demo"
                aria-label="Open demo"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer ${
                isLiked ? 'text-red-400' : 'text-white/70 hover:text-red-400'
              }`}
              title={isLiked ? 'Remove like' : 'Add like'}
            >
              <Heart size={16} className={isLiked ? 'fill-red-400' : ''} />
              <span className="text-sm">{likesCount}</span>
            </button>
            
            <Link 
              href={`/projects/${project.id}`}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                (project.comments_count || 0) > 0 
                  ? 'text-lime-500 hover:text-lime-400' 
                  : 'text-white/70 hover:text-lime-400'
              }`}
              title="View comments"
            >
              <MessageCircle 
                size={16} 
                className={`${(project.comments_count || 0) > 0 ? 'fill-lime-500' : ''}`}
              />
              <span className="text-sm">{project.comments_count || 0}</span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;