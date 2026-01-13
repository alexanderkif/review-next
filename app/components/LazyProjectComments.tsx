'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from './ui/Card';

// Динамический импорт комментариев - они не критичны для первого рендера
const ProjectComments = dynamic(() => import('./ProjectComments'), {
  loading: () => (
    <Card className="mt-8">
      <CardContent className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </CardContent>
    </Card>
  ),
  ssr: false,
});

export default ProjectComments;
