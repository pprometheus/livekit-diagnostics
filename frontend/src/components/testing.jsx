import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchToken, selectPeerA } from "../redux/testRoom/testRoomSlice";
import { Room } from "livekit-client";
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  RoomContext,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function TestingContainer() {
  const dispatch = useDispatch();
  const token = useSelector(selectPeerA).token;

  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  // Fetch token for Peer A
  useEffect(() => {
    dispatch(fetchToken({ participantName: "peerA" }));
  }, [dispatch]);

  // Connect to room
  useEffect(() => {
    if (!token) return; // Wait until the token is available
    let mounted = true;

    const connect = async () => {
      if (!mounted) return;
      try {
        await room.connect(serverUrl, token);
        console.log("Connected to room successfully");
      } catch (error) {
        console.error("Error connecting to room:", error);
      }
    };

    connect();

    return () => {
      mounted = false;
      room.disconnect();
    };
  }, [room, token]);

  return <Testing room={room} />;
}

function Testing({ room }) {
  if (!room) {
    console.error("Room is not provided to Testing component.");
    return <div>Error: Room is not initialized.</div>;
  }

  return (
    <RoomContext.Provider value={room}>
      <div data-lk-theme="default" style={{ height: "100vh" }}>
        <MyVideoConference />
        <RoomAudioRenderer />
        <ControlBar />
      </div>
    </RoomContext.Provider>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}
