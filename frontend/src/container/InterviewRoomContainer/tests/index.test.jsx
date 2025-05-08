import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import InterviewRoomContainer, { startStatsPolling, getStatsData } from "..";

jest.mock("@livekit/components-styles", () => ({}));

jest.mock("livekit-client", () => ({
  Room: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    engine: {
      pcManager: {
        publisher: {
          _pc: {
            getStats: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          },
        },
        subscriber: {
          _pc: {
            getStats: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          },
        },
      },
    },
    localParticipant: {
      setCameraEnabled: jest.fn(),
      setMicrophoneEnabled: jest.fn(),
      tracks: new Map(),
    },
    state: "connected",
    on: jest.fn(),
    updateToken: jest.fn(),
    participants: new Map(),
  })),
  RoomEvent: {
    Connected: "connected",
    TrackPublished: "trackPublished",
    TrackSubscribed: "trackSubscribed",
    TrackUnpublished: "trackUnpublished",
    Disconnected: "disconnected",
  },
  Track: {
    Source: {
      Camera: "camera",
      ScreenShare: "screenShare",
      Microphone: "microphone",
    },
  },
}));

jest.mock("@livekit/components-react", () => ({
  GridLayout: ({ children }) => <div data-testid="grid-layout">{children}</div>,
  ParticipantTile: () => <div data-testid="participant-tile" />,
  useTracks: jest.fn().mockImplementation(() => []),
  useParticipant: jest.fn().mockReturnValue({}),
  RoomAudioRenderer: () => <div data-testid="room-audio-renderer" />,
  RoomContext: {
    Provider: ({ children }) => <div>{children}</div>,
  },
}));

const mockStream = { getTracks: () => [{ stop: jest.fn() }] };
navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue(mockStream),
};

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    loading: jest.fn().mockReturnValue("toast-id"),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock("luxon", () => ({
  DateTime: {
    now: jest.fn().mockReturnValue({
      toFormat: jest.fn().mockReturnValue("12:00:00 AM"),
    }),
  },
}));

jest.mock("../../../components/SideBar", () => () => (
  <div data-testid="sidebar" />
));
jest.mock("../../../components/Loader", () => () => (
  <div data-testid="loader" />
));
jest.mock("../../../components/InterviewRoom", () => () => (
  <div data-testid="interview-room" />
));

jest.mock("../../../redux/InterviewRoom/testRoomSlice", () => ({
  fetchToken: jest.fn().mockReturnValue({ type: "fetchToken" }),
  fetchTokenB: jest.fn().mockReturnValue({ type: "fetchTokenB" }),
  selectPeerA: jest.fn().mockReturnValue({ token: "tokenA" }),
  selectPeerB: jest.fn().mockReturnValue({ token: "tokenB" }),
}));

describe("InterviewRoomContainer", () => {
  const initialState = {
    testRoom: { peerA: { token: "tokenA" }, peerB: { token: "tokenB" } },
  };

  const createMockStore = (state) => ({
    getState: () => state,
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  });

  let store;

  beforeEach(() => {
    store = createMockStore(initialState);
    jest.useFakeTimers();

    global.averageLossPct = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("requests media permissions", async () => {
    render(
      <Provider store={store}>
        <InterviewRoomContainer />
      </Provider>
    );

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: true,
    });
  });

  test("startStatsPolling invokes setStatsData callback", async () => {
    const fakePc = {
      getStats: jest
        .fn()
        .mockResolvedValueOnce([
          { type: "transport", bytesSent: 1000, bytesReceived: 2000 },
          {
            type: "candidate-pair",
            state: "succeeded",
            currentRoundTripTime: 0.05,
          },
        ])
        .mockResolvedValueOnce([
          { type: "transport", bytesSent: 2000, bytesReceived: 4000 },
          {
            type: "candidate-pair",
            state: "succeeded",
            currentRoundTripTime: 0.04,
          },
        ]),
    };
    const setStatsData = jest.fn();

    // Use the exported startStatsPolling function
    startStatsPolling(fakePc, setStatsData, "RoomA");

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(setStatsData).toHaveBeenCalled();
    expect(fakePc.getStats).toHaveBeenCalled();

    // Clean up interval
    jest.clearAllTimers();
  });

  test("renders InterviewRoom component when ready", async () => {
    const mockReady = {
      hasCameraAccess: true,
      hasMicAccess: true,
      roomAState: "connected",
      roomBState: "connected",
      pcPublisher: {},
      pcSubscriber: {},
    };

    jest.spyOn(React, "useState").mockImplementation((init) => {
      if (init === null) return [true, jest.fn()]; 
      if (Array.isArray(init)) return [init, jest.fn()]; 
      return [init, jest.fn()]; 
    });

    render(
      <Provider store={store}>
        <InterviewRoomContainer />
      </Provider>
    );
  });
});
