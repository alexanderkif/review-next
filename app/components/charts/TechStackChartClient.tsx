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
      <div className="max-w-xs rounded-xl border border-white/30 bg-white/10 p-3 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-md">
        <p className="mb-2 font-semibold text-white drop-shadow-lg">{data.name}</p>
        <div className="space-y-1">
          {data.projectNames &&
            data.projectNames.map((projectName: string, index: number) => (
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
        <div className="mb-3 h-40 min-h-[160px] lg:h-48 lg:min-h-[192px]">
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
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="truncate text-white/80">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* На маленьких экранах (когда панели вертикально) - легенда справа */}
      <div className="block lg:hidden">
        <div className="flex gap-4">
          {/* Chart Container */}
          <div className="h-32 min-h-[128px] flex-1 md:h-40 md:min-h-[160px]">
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
          <div className="grid min-w-[100px] grid-cols-1 gap-1 text-xs">
            {data.slice(0, 8).map((item, index) => (
              <div key={`legend-mobile-${item.name}-${index}`} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="truncate text-[11px] text-white/80 md:text-xs">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
