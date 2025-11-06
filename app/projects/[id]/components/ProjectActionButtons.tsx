'use client';

import { Github, ExternalLink } from 'lucide-react';

interface ProjectActionButtonsProps {
  githubUrl?: string;
  demoUrl?: string;
}

export default function ProjectActionButtons({ githubUrl, demoUrl }: ProjectActionButtonsProps) {
  return (
    <div className="flex gap-3">
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] p-3 rounded-xl bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md border border-white/40 text-[#bfc9d6] hover:text-blue-700 text-sm transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/80 hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)]"
          title="View on GitHub"
          aria-label="View on GitHub"
        >
          <Github size={20} />
        </a>
      )}
      
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] p-3 rounded-xl bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md border border-white/40 text-[#bfc9d6] hover:text-blue-700 text-sm transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/80 hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)]"
          title="Open demo"
          aria-label="Open demo"
        >
          <ExternalLink size={20} />
        </a>
      )}
    </div>
  );
}