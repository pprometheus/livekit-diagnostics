import React, { useEffect, useState } from "react";
import {
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import { Track as LKTrack, Room } from "livekit-client";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchToken,
  fetchTokenB,
  selectPeerA,
  selectPeerB,
} from "../../redux/InterviewRoom/testRoomSlice";
import InterviewRoom from "../../components/InterviewRoom";

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function InterviewRoomContainer() {
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
    if (!token || !tokenB) return;

    // const handle = setTimeout(async () => {
    //   try {
    //     dispatch(fetchToken({ participantName: "peerA" }));
    //     dispatch(fetchTokenB({ participantName: "peerB" }));
    //     console.log("Token refresh dispatched");
    //     console.log("Token refresh dispatched", token, tokenB);
    //     roomA.updateToken(token);
    //     roomB.updateToken(tokenB);

    //   } catch (err) {
    //     console.error("Token refresh failed:", err);
    //     roomA.disconnect();
    //     roomB.disconnect();
    //   }
    // }, 2 * 60 * 1000); // 9 minutes

    return () => clearTimeout(handle);
  }, [dispatch, token, tokenB, roomA, roomB]);

  useEffect(() => {
    if (!token || !tokenB) return;

    let mounted = true;

    const connectRoom = async () => {
      if (!mounted) return;

      await roomA.connect(serverUrl, token);
      await roomA.localParticipant?.setMicrophoneEnabled(true);
      await roomA.localParticipant?.setCameraEnabled(true);

      if (tokenB) await roomB?.connect(serverUrl, tokenB);
   
      console.log("roomB connected:", roomB, roomA);

      const publisherPc = roomA.engine.pcManager.publisher._pc;
      if (publisherPc) startStatsPolling(publisherPc, setStatsData, "RoomA");
    };

    connectRoom();

    return () => {
      mounted = false;
      roomA.disconnect();
    };
  }, [roomA, token, tokenB]);

  return (
    <InterviewRoom
      token={token}
      roomA={roomA}
      statsData={statsData}
      //   subscriberData={subscriberData}
    />
  );
}

export const MyVideoConference = () => {
  const tracks = useTracks(
    [
      { source: LKTrack.Source.Camera, withPlaceholder: true },
      { source: LKTrack.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  const visibleTracks = tracks.filter(
    (t) => t.participant.identity !== "peerB"
  );
  return (
    <GridLayout
      tracks={visibleTracks}
      style={{ padding: "10px", borderRadius: "50px" }}
    >
      <ParticipantTile style={{ borderRadius: "10px" }} />
    </GridLayout>
  );
};

export const startStatsPolling = (pc, setStatsData, roomId) => {
  let prevBytesSent = 0;
  let prevBytesReceived = 0;

  setInterval(async () => {
    try {
      const stats = await pc.getStats();
      let upBps = 0;
      let downBps = 0;
      let rttMs = 0;
      let packetsLost = 0;
      let packetsReceived = 0;
      let fractionLost = 0; // Fraction of packets lost

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
        if (stat.type === "remote-inbound-rtp") {
          packetsLost = stat.packetsLost || 0; // Total packets lost
          packetsReceived = stat.packetsReceived || 0; // Total packets received
          fractionLost = stat.fractionLost || 0; // Fraction of packets lost
        }
      });
      console.log("Packets Lost:", packetsLost, "Fraction Lost:",fractionLost, "Packets Recived:", packetsReceived);

      const lossFraction =
        packetsLost + packetsReceived > 0
          ? (packetsLost / (packetsLost + packetsReceived)) * 100 // Convert to percentage
          : 0;
console.log("Loss Fraction:", lossFraction);
      const timestamp = new Date().toLocaleTimeString();

      setStatsData((prev) => [
        ...prev.slice(-19),
        {
          roomId: roomId,
          time: timestamp,
          upload: upBps,
          download: downBps,
          latency: rttMs,
          lossFraction: lossFraction,
        },
      ]);
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, 1000);
};
