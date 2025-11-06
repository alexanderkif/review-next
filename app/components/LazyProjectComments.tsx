'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from './ui/Card';

// Динамический импорт комментариев - они не критичны для первого рендера
const ProjectComments = dynamic(() => import('./ProjectComments'), {
  loading: () => (
    <Card className="mt-8">
      <CardContent className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </CardContent>
    </Card>
  ),
  ssr: false
});

export default ProjectComments;
