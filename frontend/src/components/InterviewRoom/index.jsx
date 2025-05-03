import React from "react";
import TopBar from "../TopBar";
import Controls from "../Controls";
import Sidebar from "../SideBar";
import {
  ControlBar,
  RoomAudioRenderer,
  RoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import Chart from "../Chart";
import { MyVideoConference } from "../../container/InterviewRoomContainer/interviewRoomContainer";

const InterviewRoom = ({ token, roomA, statsData }) => {
  if (!token) return <div>Loading...</div>;
  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-between">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <RoomContext.Provider value={roomA}>
          <div className="h-screen flex bg-gray-800 text-white">
            <div className="w-2/3 flex flex-col p-2">
              <MyVideoConference />
              <RoomAudioRenderer />
              <ControlBar />
            </div>
          </div>
        </RoomContext.Provider>
        <Sidebar>
          <Chart
            title="Bandwidth"
            data={statsData}
            xDataKey="time"
            lines={[
              { dataKey: "download", name: "Download", stroke: "#00bfff" },
              { dataKey: "upload", name: "Upload", stroke: "#cc88ff" },
            ]}
          />

          <Chart
            title="Latency (ms)"
            data={statsData}
            xDataKey="time"
            yDomain={[0, "auto"]}
            lines={[
              { dataKey: "latency", name: "RTT (ms)", stroke: "#ff7300" },
            ]}
          />
        </Sidebar>
      </div>

      <Controls />
    </div>
  );
};

export default InterviewRoom;
