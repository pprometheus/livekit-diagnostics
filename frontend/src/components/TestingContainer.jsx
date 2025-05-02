import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchToken, selectPeerA } from "../redux/testRoom/testRoomSlice";
import { Room } from "livekit-client";
import Testing from "./testing";

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