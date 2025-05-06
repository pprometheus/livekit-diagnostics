// src/components/Chart.stories.tsx
import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import Chart from '.';

export default {
  title: 'Components/Chart',
  component: Chart,
};

export const LiveUpdatingChart = () => {
  // initial timestamps at 1‑minute intervals
  const [data, setData] = useState(
    Array.from({ length: 8 }).map((_, i) => ({
      time: DateTime.now().minus({ minutes: 7 - i }).toFormat('hh:mm a'),
      value: Math.random() * 100,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData((old) => {
        // drop the oldest and add a new random point
        const nextTime = DateTime.now().toFormat('hh:mm a');
        const nextValue = Math.random() * 100;
        return [
          ...old.slice(1),
          { time: nextTime, value: nextValue },
        ];
      });
    }, 2000); // every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Chart
      title="Live Metrics"
      data={data}
      xDataKey="time"
      lines={[{ dataKey: 'value', name: 'Value', stroke: '#82ca9d' }]}
      yDomain={[0, 100]} // Example domain for y-axis
      unit="%" // Example unit for values
      yTickFormatter={(value) => `${value}%`} // Example formatter for y-axis ticks
      // pass through any animation props if needed
    />
  );
};
