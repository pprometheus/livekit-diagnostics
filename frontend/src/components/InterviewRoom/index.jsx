import React, { useState, useEffect } from "react";
import TopBar from "../TopBar";
import Controls from "../Controls";
import Sidebar from "../SideBar";
import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import "@livekit/components-styles";
import Chart from "../Chart";
import { MyVideoConference } from "../../container/InterviewRoomContainer";

const InterviewRoom = ({ token, roomA, statsData }) => {
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

  const isKbps = statsData.every((d) => d.download < 0.01 && d.upload < 0.01);

  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <RoomContext.Provider value={roomA}>
        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          <MyVideoConference />
          <RoomAudioRenderer />

          {isSidebarVisible && (
            <Sidebar>
              <Chart
                title={`Bandwidth (${isKbps ? "Kbps" : "Mbps"})`}
                data={statsData}
                xDataKey="time"
                yTickFormatter={(value) =>
                  isKbps
                    ? `${(value * 1000).toFixed(2)}`
                    : `${value.toFixed(2)}`
                }
                lines={[
                  {
                    dataKey: "download",
                    name: "Download",
                    stroke: "#00bfff",
                  },
                  {
                    dataKey: "upload",
                    name: "Upload",
                    stroke: "#cc88ff",
                  },
                ]}
                showLegend={true}
                tooltip={(value) => {
                  return value < 0.01
                    ? `${(value * 1000).toFixed(2)} Kbps`
                    : `${value.toFixed(2)} Mbps`;
                }}
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
                    dataKey: "averageLossPct",
                    name: "Loss (%)",
                    stroke: "#ff0000",
                  },
                ]}
              />
            </Sidebar>
          )}
        </div>

        <Controls onToggleSidebar={toggleSidebar} />
      </RoomContext.Provider>
    </div>
  );
};

export default InterviewRoom;
