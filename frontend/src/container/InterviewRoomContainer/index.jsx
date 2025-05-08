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
  selectPeerByName,
} from "../../redux/InterviewRoom/testRoomSlice";
import InterviewRoom from "../../components/InterviewRoom";
import { DateTime } from "luxon";
import Loader from "../../components/Loader";

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function InterviewRoomContainer() {
  const [statsData, setStatsData] = useState([]);
  const dispatch = useDispatch();
  const token = useSelector(selectPeerByName("peerA"))?.token;

  const [roomA] = useState(() => new Room({}));

  const [peerName, setPeerName] = useState(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(null);
  const [hasMicAccess, setHasMicAccess] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("peerName");
    console.log("name", name);
    setPeerName(name);
    dispatch(fetchToken({ participantName: peerName ? peerName : "peerA" }));
    requestPermissions();
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

  useEffect(() => {
    if (
      !peerName ||
      !token ||
      hasCameraAccess !== true ||
      hasMicAccess !== true
    )
      return;

    toast.loading("Connecting");

    const connectRoom = async () => {
      await roomA.connect(serverUrl, token, { reconnect: true });
      await roomA.localParticipant?.setMicrophoneEnabled(true);
      await roomA.localParticipant?.setCameraEnabled(true);

      console.log("roomB connected:", roomA);

      const publisherPc = roomA.localParticipant.engine.pcManager.publisher._pc;
      if (publisherPc) startStatsPolling(publisherPc, setStatsData, "RoomA");

      const subscriberPc =
        roomA.localParticipant.engine.pcManager.subscriber._pc;
      if (subscriberPc) getStatsData(subscriberPc);
    };

    connectRoom();
    trackReport();

    return () => {
      roomA.disconnect();
    };
  }, [roomA, token, hasCameraAccess, hasMicAccess]);

  async function trackReport() {
    setInterval(async () => {
      const localParticipant = roomA.localParticipant;
      const trackPub = localParticipant.getTrackPublication(
        LKTrack.Source.Camera
      );

      const stats = await trackPub.track.getRTCStatsReport();

      stats.forEach((stat) => {
        // console.log("getRTC Stats",stat)
        if (stat.type === "remote-inbound-rtp")
          console.log("Remote Inbound RTP getRTC", stat.packetsLost);
      });
      // console.log("Room Video Track", stats);
      // console.log("track report called");
    }, 1000);
  }

  const ready =
    hasCameraAccess === true &&
    hasMicAccess === true &&
    roomA.state === RoomEvent.Connected &&
    roomA.engine.pcManager.publisher._pc;
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

      console.log("Inbound RTP", packetsLostVideo);

      const avgLossP = (audioLossP + videoLossP) / 2;
      averageLossPct = avgLossP.toFixed(2);
    });
  }, 1000);
};

export const getTrackData = async (track) => {
  setInterval(async () => {
    const stats = await track.getRTCStatsReport();
    stats.forEach((stat) => {
      console.log("Track Report", stat);
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
      });

      const timestamp = DateTime.now().toFormat("hh:mm:ss a");

      setStatsData((prev) => [
        ...prev.slice(-5),
        {
          roomId: roomId,
          time: timestamp,
          upload: upBps / (1e6).toFixed(2),
          download: downBps / (1e6).toFixed(2),
          latency: rttMs,
          averageLossPct: averageLossPct,
        },
      ]);
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, 1000);
};
