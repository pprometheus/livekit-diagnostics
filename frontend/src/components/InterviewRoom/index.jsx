import React from "react";
import TopBar from "../TopBar";
import Controls from "../Controls";
import Sidebar from "../SideBar";

const InterviewRoom = () => {
  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-between">
      <TopBar />
      <Sidebar/>
      <Controls />
    </div>
  );
};

export default InterviewRoom;
