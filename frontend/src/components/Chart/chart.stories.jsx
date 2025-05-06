import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import Chart from ".";

export default {
  title: "Components/Chart",
  component: Chart,
};

export const LiveChart = () => {
  const [data, setData] = useState(
    Array.from({ length: 8 }).map((_, i) => ({
      time: DateTime.now()
        .minus({ minutes: 7 - i })
        .toFormat("hh:mm a"),
      value: Math.random() * 100,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData((old) => {
        const nextTime = DateTime.now().toFormat("hh:mm a");
        const nextValue = Math.random() * 100;
        return [...old.slice(1), { time: nextTime, value: nextValue }];
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <Chart
      title="Live Metrics"
      data={data}
      xDataKey="time"
      lines={[{ dataKey: "value", name: "Value", stroke: "#82ca9d" }]}
      yDomain={[0, 100]}
      unit="%"
      yTickFormatter={(value) => `${value}%`}
    />
  );
};
