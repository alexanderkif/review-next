'use client';

import { Github, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ProjectActionButtonsProps {
  githubUrl?: string;
  demoUrl?: string;
}

export default function ProjectActionButtons({ githubUrl, demoUrl }: ProjectActionButtonsProps) {
  return (
    <div className="flex gap-3">
      {githubUrl && (
        <Button 
          variant="glass" 
          size="md"
          className="min-w-[44px] min-h-[44px] p-3"
          onClick={() => window.open(githubUrl, '_blank')}
          title="View on GitHub"
          aria-label="View on GitHub"
        >
          <Github size={20} />
        </Button>
      )}
      
      {demoUrl && (
        <Button 
          variant="glass" 
          size="md"
          className="min-w-[44px] min-h-[44px] p-3"
          onClick={() => window.open(demoUrl, '_blank')}
          title="Open demo"
          aria-label="Open demo"
        >
          <ExternalLink size={20} />
        </Button>
      )}
    </div>
  );
}