"use client";
import React from "react";
import {
  ControlBar,
  RoomAudioRenderer,
  RoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";

import { MyVideoConference } from "./TestingContainer";
import Chart from "./Chart";

export default function TestRoom({token, roomA,statsData}) {

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
