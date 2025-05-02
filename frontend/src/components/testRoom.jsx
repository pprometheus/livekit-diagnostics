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
import { fetchToken, selectPeerA, selectPeerB } from "../redux/testRoom/testRoomSlice";

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
  const tokenB = useSelector(selectPeerB);
  const token = useSelector(selectPeerA).token;

  const [statsData, setStatsData] = useState([]);
  const [roomA] = useState(
    () =>
      new Room({
        adaptiveStream: false,
        dynacast: false,
      })
  );

  const [roomB] = useState(
    () =>
      new Room({
        adaptiveStream: false,
        dynacast: false,
      })
  );

  // useEffect(() => {
  //   dispatch(fetchToken({ participantName: "peerB" }));
  // }, []);

  useEffect(() => {
    dispatch(fetchToken({ participantName: "peerA" }));
  }, []);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchToken({ participantName: "peerB" }));
    console.log("peerb:", tokenB);
    let mounted = true;

    const connectRoom = async () => {
      if (!mounted) return;

      await roomA.connect(serverUrl, token);
      await roomA.localParticipant?.setMicrophoneEnabled(true);
      await roomA.localParticipant?.setCameraEnabled(true);

      // await roomB?.connect(serverUrl, tokenB);



      const publisherPc = roomA.engine.pcManager.publisher._pc;
      if (publisherPc) startStatsPolling(publisherPc, setStatsData);

      roomA.on("transportsCreated", ({ _pc }) => {
        if (_pc) startStatsPolling(_pc, setStatsData);
        else console.error("RTCPeerConnection is undefined");
      });
    };

    connectRoom();

    return () => {
      mounted = false;
      roomA.disconnect();
    };
  }, [roomA, token]);

  if (!token) return <div>Loading...</div>;

  return (
    <RoomContext.Provider value={roomA}>
      <div className="h-screen flex bg-gray-800 text-white">
        {/* Video Section (2/3 width) */}
        <div className="w-2/3 flex flex-col p-2">
          <MyVideoConference />
          <RoomAudioRenderer />
          <ControlBar />
        </div>

        <div className="w-1/3 flex flex-col gap-4 p-2 overflow-y-auto h-full">
          <div className="bg-gray-900 rounded-lg shadow p-4 flex flex-col flex-1">
            <h3 className="text-gray-200 mb-2">Bandwidth</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={statsData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  h
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
                    dataKey="download"
                    stroke="#00bfff"
                    strokeWidth={2}
                    dot={false}
                    name="Download"
                  />
                  <Line
                    type="monotone"
                    dataKey="upload"
                    stroke="#cc88ff"
                    strokeWidth={2}
                    dot={false}
                    name="Upload"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          \{" "}
          <div className="bg-gray-900 rounded-lg shadow p-4 flex flex-col flex-1">
            <h3 className="text-gray-200 mb-2">Latency (ms)</h3>
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
                    name="RTT (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
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
