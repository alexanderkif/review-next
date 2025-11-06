'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '../ui/Card';

// Динамический импорт тяжелых чартов для уменьшения initial bundle
const TechStackChart = dynamic(() => import('./TechStackChart'), {
  loading: () => (
    <Card variant="glass" className="h-full w-full text-white min-w-[250px]">
      <CardContent className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </CardContent>
    </Card>
  ),
  ssr: false
});

const EngagementChart = dynamic(() => import('./EngagementChart'), {
  loading: () => (
    <Card variant="glass" className="h-full w-full text-white">
      <CardContent className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </CardContent>
    </Card>
  ),
  ssr: false
});

export { TechStackChart, EngagementChart };
