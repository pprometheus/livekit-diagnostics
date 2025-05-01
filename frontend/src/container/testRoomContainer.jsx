"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LiveKitRoom } from "@livekit/components-react";
import { fetchToken, selectToken } from "../redux/testRoom/testRoomSlice";
import TestRoomView from "./TestRoomView";

const serverUrl = "wss://test-bsueauex.livekit.cloud";

export default function TestRoomContainer() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  const [statsData, setStatsData] = useState([]);

  // Fetch token on mount
  useEffect(() => {
    dispatch(fetchToken({ roomName: "Testing Room" }));
  }, [dispatch]);

  if (!token) {
    return <div>Loading...</div>;
  }

  // Wrap in LiveKitRoom so hooks in TestRoomView work
  return (
    <LiveKitRoom serverUrl={serverUrl} token={token} connect={true}>
      <TestRoomView statsData={statsData} onStatsReady={setStatsData} />
    </LiveKitRoom>
  );
}
