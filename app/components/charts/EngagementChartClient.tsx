'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-3 text-white max-w-xs shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
        <p className="font-semibold mb-2 text-white drop-shadow-lg">{data.date}</p>
        <div className="space-y-2">
          {/* Likes */}
          <div>
            <div className="flex items-center gap-1.5">
              <Heart size={14} className={data.likes > 0 ? "fill-red-400 text-red-400" : "text-white/40"} />
              <p className={`text-sm font-medium drop-shadow-md ${data.likes > 0 ? "text-red-400" : "text-white/40"}`}>
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
              <MessageCircle size={14} className={data.comments > 0 ? "fill-lime-500 text-lime-500" : "text-white/40"} />
              <p className={`text-sm font-medium drop-shadow-md ${data.comments > 0 ? "text-lime-500" : "text-white/40"}`}>
                {data.comments > 0 ? `${data.comments} Comment${data.comments !== 1 ? 's' : ''}` : 'No comments'}
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
      <div className="h-48 md:h-64 min-h-[192px] md:min-h-[256px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.7)"
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                fontSize={10}
                tick={{ fontSize: 10 }}
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
          <div className="flex items-center justify-center h-full text-white/60">
            <div className="animate-pulse">Loading chart...</div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-white/80">Likes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
          <span className="text-white/80">Comments</span>
        </div>
      </div>
    </>
  );
}
