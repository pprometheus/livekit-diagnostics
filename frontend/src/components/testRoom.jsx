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
import {
  fetchToken,
  fetchTokenB,
  selectPeerA,
  selectPeerB,
} from "../redux/testRoom/testRoomSlice";

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
  // Destructure tokens for clarity
  const { token: tokenA } = useSelector(selectPeerA);
  const { token: tokenB } = useSelector(selectPeerB);

  const [statsData, setStatsData] = useState([]);
  const [roomA] = useState(() => new Room({ adaptiveStream: false, dynacast: false }));
  const [roomB] = useState(() => new Room({ adaptiveStream: false, dynacast: false }));

  // 1) Fetch both tokens on mount
  useEffect(() => {
    dispatch(fetchToken({ participantName: "peerA" }));
    dispatch(fetchTokenB({ participantName: "peerB" }));
  }, [dispatch]);

  // 2) When both tokens are ready, connect both peers
  useEffect(() => {
    if (!tokenA || !tokenB) return;
    let mounted = true;

    const connectRooms = async () => {
      // Connect Peer A (publisher)
      try {
        await roomA.connect(serverUrl, tokenA);
        await roomA.localParticipant.setMicrophoneEnabled(true);
        await roomA.localParticipant.setCameraEnabled(true);
        console.log("✅ roomA connected");
      } catch (e) {
        console.error("Peer A connect failed:", e);
        return;
      }

      // Connect Peer B (subscriber)
      try {
        await roomB.connect(serverUrl, tokenB);
        console.log("✅ roomB connected");
      } catch (e) {
        console.error("Peer B connect failed:", e);
        return;
      }

      // Start polling Peer A's stats (bandwidth + RTT)
      const pubPc = roomA.engine.pcManager.publisher._pc;
      if (pubPc) {
        startPublisherStatsPolling(pubPc, setStatsData);
      }

      // Start polling Peer B's inbound-rtp stats (packet loss)
      const subPc = roomB.engine.pcManager.subscriber._pc;
      if (subPc) {
        startSubscriberStatsPolling(subPc);
      }
    };

    connectRooms();

    return () => {
      mounted = false;
      roomA.disconnect();
      roomB.disconnect();
    };
  }, [tokenA, tokenB, roomA, roomB]);

  if (!tokenA || !tokenB) return <div>Loading tokens...</div>;

  return (
    <RoomContext.Provider value={roomA}>
      <div className="h-screen flex bg-gray-800 text-white">
        {/* Video Section */}
        <div className="w-2/3 flex flex-col p-2">
          <MyVideoConference />
          <RoomAudioRenderer />
          <ControlBar />
        </div>

        {/* Metrics Charts */}
        <div className="w-1/3 flex flex-col gap-4 p-2 overflow-y-auto h-full">
          {/* Bandwidth & RTT Chart */}
          <div className="bg-gray-900 rounded-lg shadow p-4 flex flex-col flex-1">
            <h3 className="text-gray-200 mb-2">Bandwidth & Latency</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={statsData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1e1e", borderColor: "#333" }}
                  labelStyle={{ color: "#ccc" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ color: "#ccc" }} />
                <Line type="monotone" dataKey="download" name="Download (B/s)" dot={false} stroke="#00bfff" />
                <Line type="monotone" dataKey="upload"   name="Upload (B/s)"   dot={false} stroke="#cc88ff" />
                <Line type="monotone" dataKey="latency"  name="RTT (ms)"        dot={false} stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </RoomContext.Provider>
  );
}

// Publisher stats: bytesSent/bytesReceived + RTT
function startPublisherStatsPolling(pc, setStatsData) {
  let prevBytesSent = 0, prevBytesRecv = 0;
  setInterval(async () => {
    const stats = await pc.getStats();
    let up = 0, down = 0, rtt = 0;
    stats.forEach(s => {
      if (s.type === "candidate-pair" && s.state === "succeeded" && s.selected) {
        rtt = s.currentRoundTripTime * 1000;
        up   = s.bytesSent     - prevBytesSent;
        down = s.bytesReceived - prevBytesRecv;
        prevBytesSent = s.bytesSent;
        prevBytesRecv = s.bytesReceived;
      }
    });
    const t = new Date().toLocaleTimeString();
    setStatsData(prev => [...prev.slice(-29), { time: t, upload: up, download: down, latency: rtt }]);
  }, 1000);
}

// Subscriber stats: packet loss for audio & video
function startSubscriberStatsPolling(pc) {
  let prevRx = { audio: 0, video: 0 }, prevLost = { audio: 0, video: 0 };
  setInterval(async () => {
    const stats = await pc.getStats();
    stats.forEach(stat => {
      if (stat.type === "inbound-rtp" && (stat.kind === "audio" || stat.kind === "video")) {
        const kind = stat.kind;
        const deltaRx   = stat.packetsReceived - prevRx[kind];
        const deltaLost = stat.packetsLost     - prevLost[kind];
        prevRx[kind]   = stat.packetsReceived;
        prevLost[kind] = stat.packetsLost;
        const lossPct = deltaRx + deltaLost > 0
          ? (deltaLost / (deltaRx + deltaLost)) * 100
          : 0;
        console.log(`[PeerB] ${kind.toUpperCase()} RX → loss: ${lossPct.toFixed(1)}%`);
      }
    });
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
  return <GridLayout tracks={tracks} style={{ height: "80vh" }}><ParticipantTile /></GridLayout>;
}
