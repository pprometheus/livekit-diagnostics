import React from "react";
import IconButton from "../IconButton";
import { ControlBar, useRoomContext } from "@livekit/components-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";

const Controls = ({ onToggleSidebar }) => {
  const room = useRoomContext();
  if (!room) return null;

  return (
    <div className="w-full h-[68px] bg-gray-900 text-white relative flex items-center justify-between px-4 pb-2 pt-4">
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
        <ControlBar variation="minimal" />
        <IconButton
          icon={<FontAwesomeIcon icon={faInfo} />}
          onClick={onToggleSidebar}
        />
      </div>
    </div>
  );
};

export default Controls;
