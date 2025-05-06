import React from "react";
import { DateTime } from "luxon";
import Chart from ".";

const meta = {
  title: "Components/Chart",
  component: Chart,
  tags: ["autodocs"],
};

export default meta;

const sampleData = [
  { time: "01:00 AM", value1: 10, value2: 15 },
  { time: "02:00 AM", value1: 20, value2: 25 },
  { time: "03:00 AM", value1: 15, value2: 30 },
  { time: "04:00 AM", value1: 25, value2: 35 },
];

export const Default = {
  args: {
    title: "Sample Line Chart",
    data: sampleData,
    xDataKey: "time",
    lines: [
      { dataKey: "value1", name: "Metric A", stroke: "#8884d8" },
      { dataKey: "value2", name: "Metric B", stroke: "#82ca9d" },
    ],
    unit: "",
  },
};

export const WithCustomYTicks = {
  args: {
    ...Default.args,
    title: "With Custom Y Tick Formatter",
    yTickFormatter: (value) => `$${value.toFixed(2)}`,
  },
};

export const SingleLine = {
  args: {
    title: "Single Line Chart",
    data: sampleData,
    xDataKey: "time",
    lines: [{ dataKey: "value1", name: "Only Metric", stroke: "#ff7300" }],
    unit: "",
  },
};
