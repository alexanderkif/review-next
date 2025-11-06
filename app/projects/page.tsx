import { auth } from '../../auth';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getProjects } from '../lib/db';
import { ProjectCard } from '../components';
import TechStackChart from '../components/charts/TechStackChart';
import EngagementChart from '../components/charts/EngagementChart';
import { getCVData } from '../lib/cv-service';
import type { Metadata } from 'next';

export const revalidate = 1800; // Кэш на 30 минут

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cvData = await getCVData();
    const projects = await getProjects();
    
    const developerName = cvData?.personalInfo?.name || 'Developer';
    const totalProjects = projects?.length || 0;
    const description = `Browse ${totalProjects} projects by ${developerName}. Professional portfolio showcasing modern software development, React, Next.js, TypeScript, and other technologies.`;
    
    return {
      title: `Projects - ${developerName} Portfolio`,
      description: description,
      keywords: `projects, portfolio, software development, ${cvData?.personalInfo?.name?.toLowerCase()}, react, typescript, nextjs`,
      openGraph: {
        title: `${totalProjects} Projects by ${developerName}`,
        description: description,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Projects - ${developerName} Portfolio`,
        description: description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: 'Projects - Developer Portfolio',
      description: 'Professional portfolio showcasing modern software development projects, React, Next.js, TypeScript, and other technologies.',
      keywords: 'projects, portfolio, software development, react, typescript, nextjs',
      openGraph: {
        title: 'Projects - Developer Portfolio',
        description: 'Professional portfolio showcasing modern software development projects',
        type: 'website',
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const projects = await getProjects(userId);
  // Данные активности теперь загружаются динамически в компоненте

  return (
    <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Row - 3 panels with adaptive sizing */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_auto_1fr] gap-6 mb-8 lg:items-stretch">
            
            {/* First Panel - Statistics Cards (auto width) */}
            <div className="order-1 flex">
              <Card className="text-white h-full w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
                    <span className="hidden sm:inline">Statistics</span>
                    <span className="sm:hidden">Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:space-y-4">
                    <div className="text-center">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold mb-1">{projects.length}</div>
                      <div className="text-white/80 text-xs lg:text-sm">Completed Projects</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold mb-1">5+</div>
                      <div className="text-white/80 text-xs lg:text-sm">Years of Experience</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold mb-1">
                        {projects.reduce((acc, p) => acc + (p.likes_count || 0), 0)}
                      </div>
                      <div className="text-white/80 text-xs lg:text-sm">Total Likes</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold mb-1">
                        {projects.reduce((acc, p) => acc + (p.comments_count || 0), 0)}
                      </div>
                      <div className="text-white/80 text-xs lg:text-sm">Total Comments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Panel - Tech Stack Chart (auto width) */}
            <div className="order-2 flex min-h-[250px] lg:min-h-0">
              <TechStackChart projects={projects} />
            </div>

            {/* Third Panel - Engagement Chart (remaining space) */}
            <div className="order-3 flex min-h-[350px] lg:min-h-0">
              <EngagementChart projects={projects} />
            </div>

          </div>

          {/* Projects Grid - Full Width Below */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </div>
  );
}

