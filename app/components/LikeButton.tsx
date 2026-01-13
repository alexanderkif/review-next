'use client';

import { useOptimistic, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from './ui/Button';
import Tooltip from './ui/Tooltip';
import { toggleProjectLike } from '../lib/actions';
import { logger } from '../lib/logger';

interface LikeButtonProps {
  projectId: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ projectId, initialLiked, initialCount }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, liked: boolean) => ({
      liked,
      count: liked ? state.count + 1 : state.count - 1,
    }),
  );

  const handleLike = () => {
    if (!session?.user) {
      // Перенаправляем на страницу авторизации
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    startTransition(async () => {
      const newLiked = !optimisticLiked.liked;
      setOptimisticLiked(newLiked);

      try {
        await toggleProjectLike(projectId);
      } catch (error) {
        // В случае ошибки откатываем оптимистичное обновление
        setOptimisticLiked(!newLiked);
        logger.error('Like error:', error);
      }
    });
  };

  return (
    <Tooltip content={optimisticLiked.liked ? 'Remove like' : 'Add like'} position="top">
      <Button
        size="sm"
        onClick={handleLike}
        disabled={isPending}
        className={`flex !min-h-[44px] !min-w-[44px] items-center gap-2 px-4 py-2 transition-all ${
          optimisticLiked.liked
            ? '!text-red-400 hover:!text-red-300'
            : '!text-white/70 hover:!text-white'
        } ${isPending ? 'opacity-70' : ''}`}
        aria-label={optimisticLiked.liked ? 'Remove like' : 'Add like'}
      >
        <Heart size={16} className={optimisticLiked.liked ? 'fill-current' : ''} />
        <span>{optimisticLiked.count}</span>
      </Button>
    </Tooltip>
  );
}
