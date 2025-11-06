'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Code2 } from 'lucide-react';

// Типы для тултипа
interface TooltipData {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TooltipData;
  }>;
}

// Компонент тултипа вне основного компонента
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/80 border border-white/20 rounded-lg p-3 text-white">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-white/80">
          {data.value} project{data.value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

interface TechData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface TechStackChartProps {
  projects?: Array<{ technologies?: string[] }>;
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

// Дополнительные цвета для неизвестных технологий (в стиле официальных логотипов)
const FALLBACK_COLORS = [
  '#E34F26', '#F7DF1E', '#61DAFB', '#4FC08D', '#DD0031',
  '#FF3E00', '#663399', '#3178C6', '#339933', '#336791',
  '#47A248', '#DC382D', '#FF9900', '#2496ED', '#E10098',
  '#1572B6', '#06B6D4', '#7952B3', '#CC6699', '#0081CB',
  '#092E20', '#FF2D20', '#6DB33F', '#326CE5', '#311C87'
];

// Детерминированная функция для получения цвета по имени технологии
const getTechColor = (techName: string): string => {
  if (TECH_COLORS[techName]) {
    return TECH_COLORS[techName];
  }
  
  // Создаем детерминированный хеш из названия технологии
  let hash = 0;
  for (let i = 0; i < techName.length; i++) {
    const char = techName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Преобразуем в 32-битное число
  }
  
  // Используем хеш для выбора цвета из предопределенного массива
  const colorIndex = Math.abs(hash) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[colorIndex];
};

const TechStackChart = ({ projects }: TechStackChartProps) => {
  const getTechData = (): TechData[] => {
    const techCount: Record<string, number> = {};
    
    if (projects && projects.length > 0) {
      projects.forEach(project => {
        if (project.technologies) {
          project.technologies.forEach(tech => {
            techCount[tech] = (techCount[tech] || 0) + 1;
          });
        }
      });
    }

    return Object.entries(techCount)
      .map(([name, count]) => ({
        name,
        value: count,
        color: getTechColor(name)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 13);
  };

  const data = getTechData();
  
  if (data.length === 0) {
    return (
      <Card variant="glass" className="text-white h-full w-full min-w-[250px]">
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
    <Card variant="glass" className="text-white h-full w-full min-w-[250px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Code2 className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
          <span className="hidden sm:inline">Technologies</span>
          <span className="sm:hidden">Tech</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* На больших экранах (когда панели горизонтально) - легенда снизу */}
        <div className="hidden lg:block">
          <div className="h-40 lg:h-48 min-h-[160px] lg:min-h-[192px] mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`desktop-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend снизу для горизонтального расположения панелей */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            {data.slice(0, 8).map((item, index) => (
              <div key={`legend-${item.name}-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-white/80 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* На маленьких экранах (когда панели вертикально) - легенда справа */}
        <div className="block lg:hidden">
          <div className="flex gap-4">
            {/* Chart Container */}
            <div className="h-32 md:h-40 flex-1 min-h-[128px] md:min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="75%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`mobile-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend справа для вертикального расположения панелей */}
            <div className="grid grid-cols-1 gap-1 text-xs min-w-[100px]">
              {data.slice(0, 8).map((item, index) => (
                <div key={`legend-mobile-${item.name}-${index}`} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-white/80 truncate text-[10px] md:text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechStackChart;