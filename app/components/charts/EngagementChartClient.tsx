'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEngagementChart } from './EngagementChartContext';
import { Heart, MessageCircle } from 'lucide-react';

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  name: string;
  payload: {
    date: string;
    likes: number;
    comments: number;
    likesProjects?: string[];
    commentsProjects?: string[];
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="max-w-xs rounded-xl border border-white/30 bg-white/10 p-3 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-md">
        <p className="mb-2 font-semibold text-white drop-shadow-lg">{data.date}</p>
        <div className="space-y-2">
          {/* Likes */}
          <div>
            <div className="flex items-center gap-1.5">
              <Heart
                size={14}
                className={data.likes > 0 ? 'fill-red-400 text-red-400' : 'text-white/40'}
              />
              <p
                className={`text-sm font-medium drop-shadow-md ${data.likes > 0 ? 'text-red-400' : 'text-white/40'}`}
              >
                {data.likes > 0 ? `${data.likes} Like${data.likes !== 1 ? 's' : ''}` : 'No likes'}
              </p>
            </div>
            {data.likesProjects && data.likesProjects.length > 0 && (
              <div className="mt-1 ml-5 space-y-0.5">
                {data.likesProjects.map((project: string, index: number) => (
                  <p key={index} className="text-xs text-white/70 drop-shadow-sm">
                    • {project}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center gap-1.5">
              <MessageCircle
                size={14}
                className={data.comments > 0 ? 'fill-lime-500 text-lime-500' : 'text-white/40'}
              />
              <p
                className={`text-sm font-medium drop-shadow-md ${data.comments > 0 ? 'text-lime-500' : 'text-white/40'}`}
              >
                {data.comments > 0
                  ? `${data.comments} Comment${data.comments !== 1 ? 's' : ''}`
                  : 'No comments'}
              </p>
            </div>
            {data.commentsProjects && data.commentsProjects.length > 0 && (
              <div className="mt-1 ml-5 space-y-0.5">
                {data.commentsProjects.map((project: string, index: number) => (
                  <p key={index} className="text-xs text-white/70 drop-shadow-sm">
                    • {project}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function EngagementChartClient() {
  const { data } = useEngagementChart();

  return (
    <>
      <div className="h-48 min-h-[192px] md:h-64 md:min-h-[256px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.7)"
                fontSize={11}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.7)"
                fontSize={11}
                tick={{ fontSize: 11 }}
                width={30}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                name="Likes"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#84cc16"
                strokeWidth={2}
                dot={{ fill: '#84cc16', strokeWidth: 2, r: 3 }}
                name="Comments"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-white/80">
            <div className="animate-pulse">Loading chart...</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400"></div>
          <span className="text-white/80">Likes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-lime-500"></div>
          <span className="text-white/80">Comments</span>
        </div>
      </div>
    </>
  );
}
