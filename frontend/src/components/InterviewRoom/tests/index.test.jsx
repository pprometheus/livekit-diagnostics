import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("../../Topbar", () => () => <div data-testid="top-bar" />);
jest.mock("../../Controls", () => ({ onToggleSidebar }) => (
  <div data-testid="controls" />
));
jest.mock("../../SideBar", () => ({ children }) => (
  <div data-testid="sidebar">{children}</div>
));
jest.mock("../../Chart", () => ({ title }) => (
  <div data-testid="chart" data-title={title} />
));
jest.mock("@livekit/components-styles", () => ({}));
jest.mock("@livekit/components-react", () => ({
  RoomAudioRenderer: () => <div data-testid="room-audio-renderer" />,
  RoomContext: { Provider: ({ children }) => children }
}));
jest.mock("../../../container/InterviewRoomContainer", () => ({
  MyVideoConference: () => <div data-testid="video-conference" />
}));

const InterviewRoom = require("../index").default;

describe("InterviewRoom Component", () => {
  const mockProps = {
    token: "test-token",
    roomA: { room: "mock-room" },
    statsData: [
      {
        time: "10:00 AM",
        download: 5000000,
        upload: 1000000,
        latency: 25,
        lossFraction: 0.5,
      }
    ]
  };

  test("renders without crashing", () => {
    render(<InterviewRoom {...mockProps} />);
    
    expect(document.querySelector(".flex-col")).toBeInTheDocument();
  });

  test("renders all required child components", () => {
    render(<InterviewRoom {...mockProps} />);
    
    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("video-conference")).toBeInTheDocument();
    expect(screen.getByTestId("room-audio-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
  });

  test("renders sidebar with charts by default", () => {
    render(<InterviewRoom {...mockProps} />);
    
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    
    const charts = screen.getAllByTestId("chart");
    expect(charts).toHaveLength(3);
    
    expect(charts[0].getAttribute("data-title")).toBe("Bandwidth (Mbps)");
    expect(charts[1].getAttribute("data-title")).toBe("Latency (ms)");
    expect(charts[2].getAttribute("data-title")).toBe("Packet Loss (%)");
  });
});