import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import InterviewRoom from "..";
jest.mock("@livekit/components-styles", () => ({}));

jest.mock("../../TopBar", () => () => <div data-testid="topbar" />);
jest.mock("../../Controls", () => ({ onToggleSidebar }) => (
  <button data-testid="controls" onClick={onToggleSidebar} />
));
jest.mock("../../SideBar", () => ({ children }) => (
  <div data-testid="sidebar">{children}</div>
));
jest.mock("../../Chart", () => () => <div data-testid="chart" />);
jest.mock(
  "../../../container/InterviewRoomContainer/interviewRoomContainer",
  () => ({
    MyVideoConference: () => <div data-testid="videoconference" />,
  })
);

jest.mock("@livekit/components-react", () => ({
  RoomAudioRenderer: () => <div data-testid="audio-renderer" />,
  RoomContext: { Provider: ({ children }) => children },
}));

describe("InterviewRoom Component", () => {
  const mockToken = "test-token";
  const mockStatsData = [
    {
      time: "10:00 AM",
      download: 5000000,
      upload: 1000000,
      latency: 25,
      lossFraction: 0.5,
    },
  ];
  const mockRoomA = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders main components when token exists", () => {
    render(
      <InterviewRoom
        token={mockToken}
        roomA={mockRoomA}
        statsData={mockStatsData}
      />
    );

    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.getByTestId("videoconference")).toBeInTheDocument();
    expect(screen.getByTestId("audio-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
  });

  test("shows sidebar by default with charts", () => {
    render(
      <InterviewRoom
        token={mockToken}
        roomA={mockRoomA}
        statsData={mockStatsData}
      />
    );

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toBeInTheDocument();
    expect(screen.getAllByTestId("chart")).toHaveLength(3);
  });

  test("toggles sidebar via controls button", () => {
    render(
      <InterviewRoom
        token={mockToken}
        roomA={mockRoomA}
        statsData={mockStatsData}
      />
    );

    const button = screen.getByTestId("controls");
    fireEvent.click(button);
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  test("toggles sidebar via Shift+D keyboard shortcut", () => {
    render(
      <InterviewRoom
        token={mockToken}
        roomA={mockRoomA}
        statsData={mockStatsData}
      />
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "D", shiftKey: true });
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "D", shiftKey: true });
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  test("passes correct props to Charts", () => {
    const { container } = render(
      <InterviewRoom
        token={mockToken}
        roomA={mockRoomA}
        statsData={mockStatsData}
      />
    );

    const charts = container.querySelectorAll('[data-testid="chart"]');
    expect(charts.length).toBe(3);
  });

  test("to match snapshot", () => {
    const { container } = render(
      <InterviewRoom
        token={mockToken}
        roomA={mockRoomA}
        statsData={mockStatsData}
      />
    );
    expect(container).toMatchSnapshot();
  });

  test("cleans up event listeners on unmount", () => {
    const { unmount } = render(
      <InterviewRoom
        token={mockToken}
        roomA={mockRoomA}
        statsData={mockStatsData}
      />
    );

    const originalRemoveListener = window.removeEventListener;
    window.removeEventListener = jest.fn();

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );

    window.removeEventListener = originalRemoveListener;
  });
});
