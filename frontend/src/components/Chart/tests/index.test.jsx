import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import { Line, XAxis, YAxis, Tooltip } from "recharts";
import Chart from "..";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: jest.fn(() => <div>Line</div>),
  XAxis: jest.fn(() => <div>XAxis</div>),
  YAxis: jest.fn(() => <div>YAxis</div>),
  CartesianGrid: jest.fn(() => <div>CartesianGrid</div>),
  Tooltip: jest.fn(() => <div>Tooltip</div>),
  Legend: jest.fn(() => <div>Legend</div>),
}));

describe("Chart Component", () => {
  const mockData = [{ time: "10:00 AM", value: 100 }];
  const mockLines = [{ dataKey: "value", name: "Value", stroke: "#ff0000" }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders title correctly", () => {
    render(<Chart title="Test Chart" data={[]} xDataKey="time" lines={[]} />);
    expect(screen.getByText("Test Chart")).toBeInTheDocument();
  });

  test("renders correct number of lines", () => {
    render(
      <Chart title="Test" data={mockData} xDataKey="time" lines={mockLines} />
    );
    expect(Line).toHaveBeenCalledTimes(mockLines.length);
    expect(Line.mock.calls[0][0].dataKey).toBe(mockLines[0].dataKey);
  });

  test("formats XAxis ticks correctly", () => {
    const xDataKey = "time";
    render(
      <Chart
        title="Test"
        data={mockData}
        xDataKey={xDataKey}
        lines={mockLines}
      />
    );

    const tickFormatter = XAxis.mock.calls[0][0].tickFormatter;
    const formattedTime = tickFormatter("10:00 AM");
    const expectedTime = DateTime.fromFormat("10:00 AM", "hh:mm a").toFormat(
      "hh:mm a"
    );
    expect(formattedTime).toBe(expectedTime);
  });

  test("configures YAxis domain and tickFormatter", () => {
    const yDomain = [0, 100];
    const yTickFormatter = (value) => `${value}%`;
    render(
      <Chart
        title="Test"
        data={mockData}
        xDataKey="time"
        lines={mockLines}
        yDomain={yDomain}
        yTickFormatter={yTickFormatter}
      />
    );

    const yAxisProps = YAxis.mock.calls[0][0];
    expect(yAxisProps.domain).toEqual(yDomain);
    expect(yAxisProps.tickFormatter(50)).toBe("50%");
  });

  test("applies correct styles to Tooltip", () => {
    render(
      <Chart title="Test" data={mockData} xDataKey="time" lines={mockLines} />
    );

    const tooltipProps = Tooltip.mock.calls[0][0];
    expect(tooltipProps.contentStyle.backgroundColor).toBe("#1A202C");
    expect(tooltipProps.labelStyle.color).toBe("#CBD5E0");
  });

  test("matches snapshot", () => {
    render(
      <Chart title="Test" data={mockData} xDataKey="time" lines={mockLines} />
    );
    const chartElement = screen.getByTestId("line-chart");
    expect(chartElement).toMatchSnapshot();
  });
});
