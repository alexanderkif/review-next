'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { logger } from '../lib/logger';
import { toggleProjectLike } from '../lib/actions';
import Tooltip from './ui/Tooltip';

interface ProjectCardLikeButtonProps {
  projectId: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function ProjectCardLikeButton({
  projectId,
  initialLiked,
  initialCount,
}: ProjectCardLikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    // Проверяем авторизацию
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const result = await toggleProjectLike(projectId);

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

  return (
    <Tooltip content={isLiked ? 'Remove like' : 'Add like'} position="top">
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`flex cursor-pointer items-center gap-1 rounded transition-colors focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none disabled:opacity-50 ${
          isLiked ? 'text-red-400' : 'text-white/70 hover:text-red-400'
        }`}
      >
        <Heart size={16} className={isLiked ? 'fill-red-400' : ''} />
        <span className="text-sm">{likesCount}</span>
      </button>
    </Tooltip>
  );
}
