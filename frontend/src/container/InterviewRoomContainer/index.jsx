"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import { Track as LKTrack, Room, RoomEvent } from "livekit-client";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchToken,
  fetchTokenB,
  selectPeerA,
  selectPeerB,
} from "../../redux/InterviewRoom/testRoomSlice";
import InterviewRoom from "../../components/InterviewRoom";
import { DateTime } from "luxon";
import Loader from "../../components/Loader";

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function InterviewRoomContainer() {
  const [statsData, setStatsData] = useState([]);
  const dispatch = useDispatch();
  const tokenB = useSelector(selectPeerB).token;
  const token = useSelector(selectPeerA).token;

  const [roomA] = useState(() => new Room({}));
  const [roomB] = useState(() => new Room({}));

  const [hasCameraAccess, setHasCameraAccess] = useState(null);
  const [hasMicAccess, setHasMicAccess] = useState(null);

  useEffect(() => {
    dispatch(fetchToken({ participantName: "peerA" }));
  }, []);

  useEffect(() => {
    dispatch(fetchTokenB({ participantName: "peerB" }));
  }, []);

  const requestPermissions = async () => {
    let loadingToast;
    try {
      toast.dismiss();
      loadingToast = toast.loading("Requesting permissions...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => track.stop());

      setHasCameraAccess(true);
      setHasMicAccess(true);
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.dismiss(loadingToast);

      let camDenied = false;
      let micDenied = false;

      if (camDenied || micDenied) {
        toast.dismiss();
        toast.error({ duration: Infinity });
      } else {
        toast.dismiss();
        toast.error("Please allow camera and microphone access", {
          duration: Infinity,
        });
        console.error("Media access error:", err);
      }
    }
  };

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
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!token || !tokenB) return;
    if (hasCameraAccess !== true || hasMicAccess !== true) return;

    let mounted = true;
    const connectingToast = toast.loading("Connecting");

    const connectRoom = async () => {
      if (!mounted) return;

      await roomA.connect(serverUrl, token, { reconnect: true });
      await roomA.localParticipant?.setMicrophoneEnabled(true);
      await roomA.localParticipant?.setCameraEnabled(true);

      if (tokenB) await roomB?.connect(serverUrl, tokenB, { reconnect: true });

      console.log("roomB connected:", roomB, roomA);

      const publisherPc = roomA.localParticipant.engine.pcManager.publisher._pc;
      if (publisherPc) startStatsPolling(publisherPc, setStatsData, "RoomA");

      const subscriberPc = roomA.localParticipant.engine.pcManager.subscriber._pc;
      if (subscriberPc) getStatsData(subscriberPc);
    };

    connectRoom();

    return () => {
      mounted = false;
      roomA.disconnect();
      roomB.disconnect();
    };
  }, [roomA, token, tokenB, hasCameraAccess, hasMicAccess]);

  const ready =
    hasCameraAccess === true &&
    hasMicAccess === true &&
    roomA.state === RoomEvent.Connected &&
    roomB.state === RoomEvent.Connected &&
    roomA.engine.pcManager.publisher._pc &&
    roomB.engine.pcManager.subscriber._pc;

  if (!ready) {
    return (
      <>
        <Toaster position="top-right" reverseOrder={false} />
        <Loader />;
      </>
    );
  }

  return (
    <>
      <InterviewRoom token={token} roomA={roomA} statsData={statsData} />
    </>
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
      }
      if (stat.type === "inbound-rtp" && stat.kind === "audio") {
        packetsLostAudio = stat.packetsLost;
        packetsReceivedAudio = stat.packetsReceived;
      }
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
        // if (stat.type === "remote-inbound-rtp") {
        //   packetsLost = stat.packetsLost || 0;
        //   packetsReceived = stat.packetsReceived;
        //   fractionLost = stat.fractionLost || 0; /
        // }
      });

      // const lossFraction =
      //   packetsLost + packetsReceived > 0
      //     ? (packetsLost / (packetsLost + packetsReceived)) * 100
      //     : 0;
      // const lossFraction = fractionLost;
      // console.log("Loss Fraction:", lossFraction);
      const timestamp = DateTime.now().toFormat("hh:mm:ss a");

      setStatsData((prev) => [
        ...prev.slice(-5),
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
