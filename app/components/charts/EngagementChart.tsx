'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Heart } from 'lucide-react';

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
}

interface Project {
  id: number;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

interface EngagementChartProps {
  projects?: Project[];
}

// Генерируем данные на основе проектов с учётом временных зон
const generateDataFromProjects = (projects: Project[], period: 'month' | 'year'): EngagementData[] => {
  const data: EngagementData[] = [];
  
  // Получаем текущее время в местной временной зоне (UTC+3)
  const now = new Date();
  const localNow = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // UTC+3
  
  if (period === 'month') {
    // Данные за последний месяц (30 дней)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(localNow);
      date.setDate(date.getDate() - i);
      
      // Используем локальную дату без времени для сравнения
      const currentDateStr = date.getFullYear() + '-' + 
                            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(date.getDate()).padStart(2, '0');
      
      // Подсчитываем активность за этот день, учитывая локальную временную зону
      const dayProjects = projects.filter(p => {
        // Конвертируем UTC время в локальное время (UTC+3)
        const projectDate = new Date(p.created_at);
        const localProjectDate = new Date(projectDate.getTime() + (3 * 60 * 60 * 1000));
        const projectDateStr = localProjectDate.getFullYear() + '-' + 
                              String(localProjectDate.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(localProjectDate.getDate()).padStart(2, '0');
        return projectDateStr === currentDateStr;
      });
      
      const likes = dayProjects.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const comments = dayProjects.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      
      data.push({
        date: date.toLocaleDateString(navigator.language, { day: '2-digit', month: '2-digit' }),
        likes: likes,
        comments: comments,
      });
    }
  } else {
    // Данные за последний год (12 месяцев)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(localNow);
      date.setMonth(date.getMonth() - i);

      
      // Подсчитываем реальную активность за этот месяц с учётом локальной временной зоны
      const monthProjects = projects.filter(p => {
        // Конвертируем UTC время в локальное время (UTC+3)
        const projectDate = new Date(p.created_at);
        const localProjectDate = new Date(projectDate.getTime() + (3 * 60 * 60 * 1000));
        const projectYear = localProjectDate.getFullYear();
        const projectMonth = localProjectDate.getMonth();
        
        return projectYear === date.getFullYear() && projectMonth === date.getMonth();
      });
      
      const likes = monthProjects.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const comments = monthProjects.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      
      data.push({
        date: date.toLocaleDateString(navigator.language, { month: 'short', year: '2-digit' }),
        likes: likes,
        comments: comments,
      });
    }
  }
  
  return data;
};

export const EngagementChart = ({ projects }: EngagementChartProps) => {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<EngagementData[]>([]);
  
  // Убеждаемся, что компонент рендерится только на клиенте
  useEffect(() => {
    setIsClient(true);
    setData(generateDataFromProjects(projects || [], period));
  }, []);
  
  // Получаем реальные данные активности при изменении периода
  useEffect(() => {
    if (!isClient) return;
    
    const fetchActivityData = async () => {
      try {
        const response = await fetch(`/api/activity?period=${period}`);
        if (response.ok) {
          const activityData = await response.json();
          setData(activityData);
        }
      } catch {
        // Если API недоступен, используем fallback
        setData(generateDataFromProjects(projects || [], period));
      }
    };
    
    fetchActivityData();
  }, [period, isClient, projects]);
  
  return (
    <Card variant="glass" className="text-white h-full w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
            <span className="hidden sm:inline">Activity</span>
            <span className="sm:hidden">Activity</span>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={period === 'month' ? 'primary-glass' : 'glass'}
              size="sm"
              onClick={() => setPeriod('month')}
              className="text-xs px-3 py-1 h-8 transition-all duration-200 hover:-translate-y-0.5"
            >
              1M
            </Button>
            <Button
              variant={period === 'year' ? 'primary-glass' : 'glass'}
              size="sm"
              onClick={() => setPeriod('year')}
              className="text-xs px-3 py-1 h-8 transition-all duration-200 hover:-translate-y-0.5"
            >
              1Y
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 md:h-64 min-h-[192px] md:min-h-[256px]">
          {isClient ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={192}>
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
      </CardContent>
    </Card>
  );
};

export default EngagementChart;