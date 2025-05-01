"use client";

import React, { useEffect, useState } from "react";
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  useRoomContext,
} from "@livekit/components-react";
import { Room, Track as LKTrack } from "livekit-client";
import "@livekit/components-styles";
import { useDispatch, useSelector } from "react-redux";
import { fetchToken, selectToken } from "../redux/testRoom/testRoomSlice";

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

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function TestRoom() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  // combine metrics: upload, download, latency
  const [statsData, setStatsData] = useState([]);
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: false,
        dynacast: false,
      })
  );

  useEffect(() => {
    dispatch(fetchToken({ roomName: "Testing Room" }));
  }, [dispatch]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const connectRoom = async () => {
      if (!mounted) return;

      await room.connect(serverUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      const publisherPc = room.engine.pcManager.publisher._pc;
      if (publisherPc) startStatsPolling(publisherPc, setStatsData);

      room.on("transportsCreated", ({ _pc }) => {
        if (_pc) startStatsPolling(_pc, setStatsData);
        else console.error("RTCPeerConnection is undefined");
      });
    };

    connectRoom();

    return () => {
      mounted = false;
      room.disconnect();
    };
  }, [room, token]);

  if (!token) return <div>Loading...</div>;

  return (
    <RoomContext.Provider value={room}>
      <div
        data-lk-theme="default"
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1 }}>
          <MyVideoConference />
        </div>
        <RoomAudioRenderer />
        <ControlBar />

        {/* Bandwidth Chart */}
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={statsData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis
                scale="log"
                domain={["dataMin", "dataMax"]}
                allowDataOverflow={true}
                label={{
                  value: "Bytes/s (log scale)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="upload"
                name="Upload (B/s)"
                stroke="#8884d8"
              />
              <Line
                type="monotone"
                dataKey="download"
                name="Download (B/s)"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Chart */}
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={statsData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis
                label={{
                  value: "RTT (ms)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="latency"
                name="RTT (ms)"
                stroke="#ff7300"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </RoomContext.Provider>
  );
}

function startStatsPolling(pc, setStatsData) {
  let prevBytesSent = 0;
  let prevBytesReceived = 0;

  setInterval(async () => {
    try {
      const stats = await pc.getStats();
      let upBps = 0;
      let downBps = 0;
      let rttMs = 0;

      stats.forEach((stat) => {
        console.log("stat", stat);
        if (stat.type === "transport") {
          upBps = stat.bytesSent - prevBytesSent;
          downBps = stat.bytesReceived - prevBytesReceived;
          prevBytesSent = stat.bytesSent;
          prevBytesReceived = stat.bytesReceived;
        }
        if (stat.type === "candidate-pair" && stat.state === "succeeded") {
          rttMs = stat.currentRoundTripTime * 1000;
        }
      });

      const timestamp = new Date().toLocaleTimeString();
      setStatsData((prev) => [
        ...prev.slice(-19),
        { time: timestamp, upload: upBps, download: downBps, latency: rttMs },
      ]);
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, 1000);
}

function MyVideoConference() {
  const room = useRoomContext();
  const tracks = useTracks(
    [
      { source: LKTrack.Source.Camera, withPlaceholder: true },
      { source: LKTrack.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      
      style={{ height: "calc(100vh - var(--lk-control-bar-height) - 400px)" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}
