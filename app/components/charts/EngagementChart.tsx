import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Heart } from 'lucide-react';
import EngagementChartClient from './EngagementChartClient';
import EngagementChartPeriodToggle from './EngagementChartPeriodToggle';
import { EngagementChartProvider } from './EngagementChartContext';

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  likesProjects?: string[];
  commentsProjects?: string[];
}

interface Project {
  id: number;
  title: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

interface EngagementChartProps {
  projects?: Project[];
}

// Server-side data generation for initial month view
function generateInitialData(projects: Project[]): EngagementData[] {
  const data: EngagementData[] = [];
  const now = new Date();
  const localNow = new Date(now.getTime() + 3 * 60 * 60 * 1000); // UTC+3

  // Last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(localNow);
    date.setDate(date.getDate() - i);

    const currentDateStr =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    const dayProjects = projects.filter((p) => {
      const projectDate = new Date(p.created_at);
      const localProjectDate = new Date(projectDate.getTime() + 3 * 60 * 60 * 1000);
      const projectDateStr =
        localProjectDate.getFullYear() +
        '-' +
        String(localProjectDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(localProjectDate.getDate()).padStart(2, '0');
      return projectDateStr === currentDateStr;
    });

    const likes = dayProjects.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const comments = dayProjects.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const likesProjects = dayProjects.filter((p) => (p.likes_count || 0) > 0).map((p) => p.title);
    const commentsProjects = dayProjects
      .filter((p) => (p.comments_count || 0) > 0)
      .map((p) => p.title);

    data.push({
      date: date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
      likes,
      comments,
      likesProjects,
      commentsProjects,
    });
  }

  return data;
}

export default function EngagementChart({ projects = [] }: EngagementChartProps) {
  const initialData = generateInitialData(projects);

  return (
    <EngagementChartProvider projects={projects} initialData={initialData}>
      <Card className="h-full w-full text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Heart className="h-4 w-4 text-red-400 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Activity</span>
            </CardTitle>
            <EngagementChartPeriodToggle />
          </div>
        </CardHeader>
        <CardContent>
          <EngagementChartClient />
        </CardContent>
      </Card>
    </EngagementChartProvider>
  );
}
