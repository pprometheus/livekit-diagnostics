import React from "react";
import IconWithLabel from "../IconLabel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faChalkboard,
  faMicrophone,
  faVideo,
  faShareSquare,
  faEllipsisH,
  faBook,
  faClipboardCheck,
  faComments,
  faUsers,
  faPhoneSlash,
  faLightbulb,
  faMessage,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Controls = () => {
  return (
    <div className="w-full h-[68px] bg-gray-900 text-white relative flex items-center justify-between px-4 pb-2 pt-4">
      {/* Left IconWithLabels */}
      <div className="flex gap-2">
        <IconWithLabel icon={faCode} label="Coding" />
        <IconWithLabel icon={faChalkboard} label="Board" />
      </div>

      {/* Middle IconWithLabels (absolute center) */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
        <IconWithLabel icon={faMicrophone} label="Mic" />
        <IconWithLabel icon={faVideo} label="Camera" />
        <IconWithLabel icon={faShareSquare} label="Share" />
        <IconWithLabel icon={faEllipsisH} label="More" />
        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center">
          <FontAwesomeIcon icon={faPhoneSlash} className="mr-1" />
          Leave
        </button>
      </div>

      {/* Right IconWithLabels */}
      <div className="flex gap-2">
        <IconWithLabel icon={faLightbulb} label="Guide" />
        <IconWithLabel icon={faClipboardCheck} label="Evaluate" />
        <IconWithLabel icon={faMessage} label="Chat" />
        <IconWithLabel icon={faUser} label="People" />
      </div>
    </div>
  );
};

export default Controls;
