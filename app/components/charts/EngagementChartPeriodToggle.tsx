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
        className={`h-8 cursor-pointer px-3 py-1 text-xs ${period === 'month' ? 'is-active' : ''}`}
      >
        1M
      </Button>
      <Button
        size="sm"
        onClick={() => setPeriod('year')}
        className={`h-8 cursor-pointer px-3 py-1 text-xs ${period === 'year' ? 'is-active' : ''}`}
      >
        1Y
      </Button>
    </div>
  );
}
