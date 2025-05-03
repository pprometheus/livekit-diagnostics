import React, { useEffect, useState } from "react";
import {
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import axios from "axios";
import { Track as LKTrack, Room } from "livekit-client";
import {
  fetchToken,
  fetchTokenB,
  selectPeerA,
  selectPeerB,
} from "../redux/testRoom/testRoomSlice";
import TestRoom from "./testRoom";
import { useDispatch, useSelector } from "react-redux";

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function TestingContainer() {
  const [statsData, setStatsData] = useState([]);
  const dispatch = useDispatch();
  const tokenB = useSelector(selectPeerB).token;
  const token = useSelector(selectPeerA).token;

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

  return <TestRoom token={token} roomA={roomA} statsData={statsData} />;
}

export const MyVideoConference = () => {
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
};

export const startStatsPolling = (pc, setStatsData) => {
  let prevBytesSent = 0;
  let prevBytesReceived = 0;

  setInterval(async () => {
    try {
      const stats = await pc.getStats();
      let upBps = 0;
      let downBps = 0;
      let rttMs = 0;

      stats.forEach((stat) => {
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
};
