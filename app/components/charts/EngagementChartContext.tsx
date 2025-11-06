'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface EngagementChartContextValue {
  period: 'month' | 'year';
  setPeriod: (period: 'month' | 'year') => void;
  data: EngagementData[];
}

const EngagementChartContext = createContext<EngagementChartContextValue | undefined>(undefined);

export function useEngagementChart() {
  const context = useContext(EngagementChartContext);
  if (!context) {
    throw new Error('useEngagementChart must be used within EngagementChartProvider');
  }
  return context;
}

// Generate data on client based on period (fallback)
const generateDataFromProjects = (projects: Project[], period: 'month' | 'year'): EngagementData[] => {
  const data: EngagementData[] = [];
  const now = new Date();
  const localNow = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // UTC+3
  
  if (period === 'month') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(localNow);
      date.setDate(date.getDate() - i);
      
      const currentDateStr = date.getFullYear() + '-' + 
                            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(date.getDate()).padStart(2, '0');
      
      const dayProjects = projects.filter(p => {
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
        date: date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
        likes,
        comments,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(localNow);
      date.setMonth(date.getMonth() - i);
      
      const monthProjects = projects.filter(p => {
        const projectDate = new Date(p.created_at);
        const localProjectDate = new Date(projectDate.getTime() + (3 * 60 * 60 * 1000));
        const projectYear = localProjectDate.getFullYear();
        const projectMonth = localProjectDate.getMonth();
        
        return projectYear === date.getFullYear() && projectMonth === date.getMonth();
      });
      
      const likes = monthProjects.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const comments = monthProjects.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        likes,
        comments,
      });
    }
  }
  
  return data;
};

interface EngagementChartProviderProps {
  children: ReactNode;
  projects: Project[];
  initialData: EngagementData[];
}

export function EngagementChartProvider({ children, projects, initialData }: EngagementChartProviderProps) {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [data, setData] = useState<EngagementData[]>(initialData);
  
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await fetch(`/api/activity?period=${period}`, {
          cache: 'default',
          next: { revalidate: 1800 }
        });
        if (response.ok) {
          const activityData = await response.json();
          setData(activityData);
        } else {
          setData(generateDataFromProjects(projects, period));
        }
      } catch {
        setData(generateDataFromProjects(projects, period));
      }
    };
    
    fetchActivityData();
  }, [period, projects]);

  return (
    <EngagementChartContext.Provider value={{ period, setPeriod, data }}>
      {children}
    </EngagementChartContext.Provider>
  );
}
