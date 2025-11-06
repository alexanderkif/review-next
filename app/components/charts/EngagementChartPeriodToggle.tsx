'use client';

import { Button } from '../ui/Button';
import { useEngagementChart } from './EngagementChartContext';

export default function EngagementChartPeriodToggle() {
  const { period, setPeriod } = useEngagementChart();
  
  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        onClick={() => setPeriod('month')}
        className={`text-xs px-3 py-1 h-8 cursor-pointer${period === 'month' ? ' is-active' : ''}`}
      >
        1M
      </Button>
      <Button
        size="sm"
        onClick={() => setPeriod('year')}
        className={`text-xs px-3 py-1 h-8 cursor-pointer${period === 'year' ? ' is-active' : ''}`}
      >
        1Y
      </Button>
    </div>
  );
}
