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
import { DateTime } from "luxon";

const serverUrl = import.meta.env.VITE_API_URL;

export default function InterviewRoomContainer() {
  const [statsData, setStatsData] = useState([]);
  const dispatch = useDispatch();
  const tokenB = useSelector(selectPeerB).token;
  const token = useSelector(selectPeerA).token;

  const [roomA] = useState(() => new Room({}));

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

  // useEffect(() => {
  //   if (!token || !tokenB) return;

  //   // const handle = setTimeout(async () => {
  //   //   try {
  //   //     dispatch(fetchToken({ participantName: "peerA" }));
  //   //     dispatch(fetchTokenB({ participantName: "peerB" }));
  //   //     console.log("Token refresh dispatched");
  //   //     console.log("Token refresh dispatched", token, tokenB);
  //   //     roomA.updateToken(token);
  //   //     roomB.updateToken(tokenB);

  //   //   } catch (err) {
  //   //     console.error("Token refresh failed:", err);
  //   //     roomA.disconnect();
  //   //     roomB.disconnect();
  //   //   }
  //   // }, 2 * 60 * 1000); // 9 minutes

  //   return () => clearTimeout(handle);
  // }, [dispatch, token, tokenB, roomA, roomB]);

  useEffect(() => {
    if (!token || !tokenB) return;

    let mounted = true;

    const connectRoom = async () => {
      if (!mounted) return;

      await roomA.connect(serverUrl, token);
      await roomA.localParticipant?.setMicrophoneEnabled(true);
      await roomA.localParticipant?.setCameraEnabled(true);

      if (tokenB) await roomB?.connect(serverUrl, tokenB);
      // await roomB.localParticipant?.setMicrophoneEnabled(true);
      // await roomB.localParticipant?.setCameraEnabled(true);

      console.log("roomB connected:", roomB, roomA);

      const publisherPc = roomA.engine.pcManager.publisher._pc;
      if (publisherPc) startStatsPolling(publisherPc, setStatsData, "RoomA");

      const subscriberPc = roomB.engine.pcManager.subscriber._pc;
      if (subscriberPc) getStatsData(subscriberPc);
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

let averageLossPct = 0;
export const getStatsData = async (pc) => {
  setInterval(async () => {
    const stats = await pc.getStats();
    let packetsLostAudio = 0;
    let packetsReceivedAudio = 0;
    let packetsLostVideo = 0;
    let packetsReceivedVideo = 0;
    stats.forEach((stat) => {
      if (stat.type === "inbound-rtp" && stat.kind === "video") {
        packetsLostVideo = stat.packetsLost;
        packetsReceivedVideo = stat.packetsReceived;
        // console.log(
        //   "Subscriber Video Packets:",
        //   "Packets Lost:",
        //   packetsLostVideo,
        //   "Packets Received:",
        //   packetsReceivedVideo
        // );
      }
      if (stat.type === "inbound-rtp" && stat.kind === "audio") {
        packetsLostAudio = stat.packetsLost;
        packetsReceivedAudio = stat.packetsReceived;
        // console.log(
        //   "Subscriber Audio Packets:",
        //   "Packets Lost:",
        //   packetsLostAudio,
        //   "Packets Received:",
        //   packetsReceivedAudio
        // );
      }
      //
      const audioLossP =
        packetsLostAudio + packetsReceivedAudio > 0
          ? (packetsLostAudio / (packetsLostAudio + packetsReceivedAudio)) * 100
          : 0;
      const videoLossP =
        packetsLostVideo + packetsReceivedVideo > 0
          ? (packetsLostVideo / (packetsLostVideo + packetsReceivedVideo)) * 100
          : 0;

      const avgLossP = (audioLossP + videoLossP) / 2;
      averageLossPct = avgLossP.toFixed(2);
      //

      // console.log("Audio Loss Percentage:", audioLossP);
      // console.log("Video Loss Percentage:", videoLossP);
      // console.log("Average Loss Percentage:", averageLossPct);
    });
  }, 1000);
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
      let fractionLost = 0;

      stats.forEach((stat) => {
        // console.log("Stat:", stat);
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
          packetsReceived = stat.packetsReceived; // Total packets received
          fractionLost = stat.fractionLost || 0; // Fraction of packets lost
        }
      });
      // console.log(
      //   "Packets Lost:",
      //   packetsLost,
      //   "Fraction Lost:",
      //   fractionLost,
      //   "Packets Recived:",
      //   packetsReceived
      // );

      // const lossFraction =
      //   packetsLost + packetsReceived > 0
      //     ? (packetsLost / (packetsLost + packetsReceived)) * 100 
      //     : 0;
      const lossFraction = fractionLost;
      // console.log("Loss Fraction:", lossFraction);
      const timestamp = DateTime.now().toFormat("hh:mm a");

      setStatsData((prev) => [
        ...prev.slice(-19),
        {
          roomId: roomId,
          time: timestamp,
          upload: upBps,
          download: downBps,
          latency: rttMs,
          lossFraction: averageLossPct,
        },
      ]);
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, 1000);
};
