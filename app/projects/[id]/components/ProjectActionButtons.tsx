'use client';

import { Github, ExternalLink } from 'lucide-react';
import Tooltip from '../../../components/ui/Tooltip';

interface ProjectActionButtonsProps {
  githubUrl?: string;
  demoUrl?: string;
}

export default function ProjectActionButtons({ githubUrl, demoUrl }: ProjectActionButtonsProps) {
  return (
    <div className="flex gap-3">
      {githubUrl && (
        <Tooltip content="View on GitHub" position="top">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/40 bg-gradient-to-br from-white/25 to-white/15 p-3 text-sm text-[#bfc9d6] backdrop-blur-md transition-all hover:text-blue-700 hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)] focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
            aria-label="View on GitHub"
          >
            <Github size={20} />
          </a>
        </Tooltip>
      )}

      {demoUrl && (
        <Tooltip content="Open demo" position="top">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/40 bg-gradient-to-br from-white/25 to-white/15 p-3 text-sm text-[#bfc9d6] backdrop-blur-md transition-all hover:text-blue-700 hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)] focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
            aria-label="Open demo"
          >
            <ExternalLink size={20} />
          </a>
        </Tooltip>
      )}
    </div>
  );
}
