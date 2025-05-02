import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Metrics = ({ statsData, legend, name }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow p-4 flex flex-col flex-1">
      <h3 className="text-gray-200 mb-2">{legend}</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={statsData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e1e",
                borderColor: "#333",
              }}
              labelStyle={{ color: "#ccc" }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#ccc" }} />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
              name={name}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Metrics;