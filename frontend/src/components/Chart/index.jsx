import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Chart = ({
  title,
  data,
  xDataKey,
  lines,
  className = '',
  yDomain
}) => (
  <div className={`bg-gray-900 rounded-lg shadow p-4 flex flex-col flex-1 ${className}`}>
    <h3 className="text-gray-200 mb-2">{title}</h3>
    <div className="flex h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis
            dataKey={xDataKey}
            stroke="#ccc"
            tickFormatter={val => val}
          />
          <YAxis
            stroke="#ccc"
            domain={yDomain || ['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              borderColor: "#333",
            }}
            labelStyle={{ color: "#ccc" }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#ccc" }} />
          {lines.map(line => (
            <Line
              key={line.dataKey}
              type={line.type || 'monotone'}
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot || false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default Chart;
