import { DateTime } from "luxon";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Chart = ({
  title,
  data,
  xDataKey,
  lines,
  className = "",
  yDomain,
  unit,
  yTickFormatter,
}) => (
  <div
    className={`bg-gray-900 rounded-lg shadow p-2 flex flex-col flex-1 ${className}`}
  >
    <h3 className="text-gray-200 mb-2 text-sm font-semibold">{title}</h3>
    <div className="flex h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            stroke="#2D3748"
            horizontal={true}
            vertical={false}
            strokeDasharray="0"
          />
          <XAxis
            dataKey={xDataKey}
            stroke="#718096"
            tick={{ fontSize: 10 }}
            tickCount={3}
            minTickGap={20}
            tickLine={{ stroke: "transparent" }}
            axisLine={{ stroke: "#2D3748" }}
            tickFormatter={(value) => {
              const dt = DateTime.fromFormat(value, "hh:mm a");
              return dt.isValid ? dt.toFormat("hh:mm a") : value;
            }}
            width={40}
            padding={{ right: 30 }}
          />
          <YAxis
            orientation="right"
            stroke="#718096"
            domain={yDomain}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "transparent" }}
            axisLine={{ stroke: "#2D3748" }}
            tickFormatter={
              yTickFormatter || ((value) => `${value}${unit || ""}`)
            }
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A202C",
              border: "none",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
            labelStyle={{
              color: "#CBD5E0",
              fontSize: 12,
              textAlign: "left",
            }}
            itemStyle={{
              color: "#fff",
              fontSize: 12,
            }}
            position={{ x: 0, y: 0 }}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              isAnimationActive={false}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.stroke}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default Chart;
