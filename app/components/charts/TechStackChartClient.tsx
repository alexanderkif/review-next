'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TooltipData {
  name: string;
  value: number;
  projectNames: string[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TooltipData;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-3 text-white max-w-xs shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
        <p className="font-semibold mb-2 text-white drop-shadow-lg">{data.name}</p>
        <div className="space-y-1">
          {data.projectNames && data.projectNames.map((projectName: string, index: number) => (
            <p key={index} className="text-sm text-white/90 drop-shadow-md">
              • {projectName}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface TechData {
  name: string;
  value: number;
  color: string;
  projectNames: string[];
  [key: string]: string | number | string[];
}

interface TechStackChartClientProps {
  data: TechData[];
}

export default function TechStackChartClient({ data }: TechStackChartClientProps) {
  return (
    <>
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
    </>
  );
}
