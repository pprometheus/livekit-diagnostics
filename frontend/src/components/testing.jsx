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

import Chart from "./Chart";

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function Testing() {
  const dispatch = useDispatch();
  const tokenB = useSelector(selectPeerB).token;
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

  useEffect(() => {
    dispatch(fetchToken({ participantName: "peerA" }));
  }, []);

  useEffect(() => {
    dispatch(fetchTokenB({ participantName: "peerB" }));
  }, []);

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const connectRoom = async () => {
      if (!mounted) return;

      await roomA.connect(serverUrl, token);
      await roomA.localParticipant?.setMicrophoneEnabled(true);
      await roomA.localParticipant?.setCameraEnabled(true);

      if (tokenB) await roomB?.connect(serverUrl, tokenB);
      roomB.on("trackSubscribed", (trackPublication, track) => {
        console.log(
          `roomB subscribed to ${trackPublication.kind} track:`,
          trackPublication.trackSid
        );
      });

      const publisherPc = roomA.engine.pcManager.publisher._pc;
      if (publisherPc) startStatsPolling(publisherPc, setStatsData);

      roomB.on("trackSubscribed", ({ _pc }) => {
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
    <>
      <RoomContext.Provider value={roomA}>
        <div className="h-screen flex bg-gray-800 text-white">
          {/* Video Section (2/3 width) */}
          <div className="w-2/3 flex flex-col p-2">
            <MyVideoConference />
            <RoomAudioRenderer />
            <ControlBar />
          </div>
          <div className="w-1/3 flex flex-col gap-4 p-2 overflow-y-auto h-full">
            <Chart
              title="Bandwidth"
              data={statsData}
              xDataKey="time"
              lines={[
                { dataKey: "download", name: "Download", stroke: "#00bfff" },
                { dataKey: "upload", name: "Upload", stroke: "#cc88ff" },
              ]}
            />
            \{" "}
            <Chart
              title="Latency (ms)"
              data={statsData}
              xDataKey="time"
              yDomain={[0, "auto"]}
              lines={[
                { dataKey: "latency", name: "RTT (ms)", stroke: "#ff7300" },
              ]}
            />
          </div>
        </div>
      </RoomContext.Provider>

      {/* <RoomContext.Provider value={roomB}>
        <div className="h-screen flex bg-gray-800 text-white">
          <div className="w-2/3 flex flex-col p-2">
            <MyVideoConference />
            <RoomAudioRenderer />
            <ControlBar />
          </div>
        </div>
      </RoomContext.Provider> */}
    </>
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
        // console.log("stat", stat);
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
  const roomA = useRoomContext();
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
