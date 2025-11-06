'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEngagementChart } from './EngagementChartContext';

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
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
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
