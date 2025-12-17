import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Code2 } from 'lucide-react';
import TechStackChartClient from './TechStackChartClient';

interface TechData {
  name: string;
  value: number;
  color: string;
  projectNames: string[];
  [key: string]: string | number | string[];
}

interface TechStackChartProps {
  projects?: Array<{ title: string; technologies?: string[] }>;
}

const TECH_COLORS: Record<string, string> = {
  // Frontend Frameworks & Libraries
  'React': '#61DAFB',
  'Next.js': '#000000',
  'Vue.js': '#4FC08D',
  'Angular': '#DD0031',
  'Svelte': '#FF3E00',
  'Nuxt.js': '#00DC82',
  'Gatsby': '#663399',
  
  // Languages
  'JavaScript': '#F7DF1E',
  'TypeScript': '#3178C6',
  'Python': '#3776AB',
  'PHP': '#777BB4',
  'Java': '#ED8B00',
  'Go': '#00ADD8',
  
  // CSS & Styling  
  'CSS': '#1572B6',
  'HTML': '#E34F26',
  'Tailwind CSS': '#06B6D4',
  'Bootstrap': '#7952B3',
  'Sass': '#CC6699',
  'Material-UI': '#0081CB',
  
  // Backend & Runtime
  'Node.js': '#339933',
  'Express': '#000000',
  'Django': '#092E20',
  'Laravel': '#FF2D20',
  'Spring': '#6DB33F',
  
  // Databases
  'PostgreSQL': '#336791',
  'MySQL': '#4479A1', 
  'MongoDB': '#47A248',
  'Redis': '#DC382D',
  'Firebase': '#FFCA28',
  
  // Cloud & DevOps
  'AWS': '#FF9900',
  'Docker': '#2496ED',
  'Kubernetes': '#326CE5',
  'Vercel': '#000000',
  
  // APIs & GraphQL
  'GraphQL': '#E10098',
  'Apollo': '#311C87',
  'Prisma': '#2D3748'
};

const FALLBACK_COLORS = [
  '#E34F26', '#F7DF1E', '#61DAFB', '#4FC08D', '#DD0031',
  '#FF3E00', '#663399', '#3178C6', '#339933', '#336791',
  '#47A248', '#DC382D', '#FF9900', '#2496ED', '#E10098',
  '#1572B6', '#06B6D4', '#7952B3', '#CC6699', '#0081CB',
  '#092E20', '#FF2D20', '#6DB33F', '#326CE5', '#311C87'
];

const getTechColor = (techName: string): string => {
  if (TECH_COLORS[techName]) {
    return TECH_COLORS[techName];
  }
  
  let hash = 0;
  for (let i = 0; i < techName.length; i++) {
    const char = techName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const colorIndex = Math.abs(hash) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[colorIndex];
};

// Server-side data processing
function getTechData(projects?: Array<{ title: string; technologies?: string[] }>): TechData[] {
  const techData: Record<string, { count: number; projects: string[] }> = {};
  
  if (projects && projects.length > 0) {
    projects.forEach(project => {
      if (project.technologies) {
        project.technologies.forEach(tech => {
          if (!techData[tech]) {
            techData[tech] = { count: 0, projects: [] };
          }
          techData[tech].count += 1;
          techData[tech].projects.push(project.title);
        });
      }
    });
  }

  return Object.entries(techData)
    .map(([name, data]) => ({
      name,
      value: data.count,
      projectNames: data.projects,
      color: getTechColor(name)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 13);
}

export default function TechStackChart({ projects }: TechStackChartProps) {
  const data = getTechData(projects);
  
  if (data.length === 0) {
    return (
      <Card className="text-white h-full w-full min-w-[250px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Code2 className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
            <span className="hidden sm:inline">Technologies</span>
            <span className="sm:hidden">Tech</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-white/60">
            No data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-white h-full w-full min-w-[250px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Code2 className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
          <span className="hidden sm:inline">Technologies</span>
          <span className="sm:hidden">Tech</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TechStackChartClient data={data} />
      </CardContent>
    </Card>
  );
}
