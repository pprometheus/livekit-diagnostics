import React, { useState, useEffect } from "react";
import TopBar from "../TopBar";
import Controls from "../Controls";
import Sidebar from "../SideBar";
import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import "@livekit/components-styles";
import Chart from "../Chart";
import { MyVideoConference } from "../../container/InterviewRoomContainer/interviewRoomContainer";

const InterviewRoom = ({ token, roomA, statsData}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => setIsSidebarVisible((v) => !v);


  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.shiftKey && e.key === "D") {
        setIsSidebarVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!token) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <RoomContext.Provider value={roomA}>
        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          <MyVideoConference />
          <RoomAudioRenderer />

          {isSidebarVisible && (
            <Sidebar>
              <span className="text-sm text-white">Network Connected via:</span>
              <Chart
                title="Bandwidth (Mbps)"
                data={statsData}
                xDataKey="time"
                yDomain={[0, 100]}
                yTickFormatter={(value) => `${(value / 1e6).toFixed(2)}`}
                lines={[
                  {
                    dataKey: "download",
                    name: "Download (bytes)",
                    stroke: "#00bfff",
                  },
                  {
                    dataKey: "upload",
                    name: "Upload (bytes)",
                    stroke: "#cc88ff",
                  },
                ]}
              />

              <Chart
                title="Latency (ms)"
                data={statsData}
                xDataKey="time"
                yDomain={[0, 50]}
                lines={[
                  { dataKey: "latency", name: "RTT (ms)", stroke: "#ff7300" },
                ]}
              />

              <Chart
                title="Packet Loss (%)"
                data={statsData}
                xDataKey="time"
                yDomain={[0, 20]}
                lines={[
                  {
                    dataKey: "lossFraction",
                    name: "Loss (%)",
                    stroke: "#ff0000",
                  },
                ]}
              />
            </Sidebar>
          )}
        </div>

        <Controls onToggleSidebar={toggleSidebar}/>
      </RoomContext.Provider>
    </div>
  );
};

export default InterviewRoom;
