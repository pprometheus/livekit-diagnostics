import React, { useState, useEffect } from "react";
import IconButton from "../IconButton";
import { ControlBar, useRoomContext } from "@livekit/components-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faChalkboard,
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faShareSquare,
  faStopCircle,
  faEllipsisH,
  faBook,
  faClipboardCheck,
  faComments,
  faUsers,
  faPhoneSlash,
  faLightbulb,
  faMessage,
  faUser,
  faArrowUpFromBracket,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";

const Controls = () => {
  const room = useRoomContext();
  if (!room) return null;
  const participant = room.localParticipant;

  // Local toggle state
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);

  // Handlers
  const toggleMic = async () => {
    const enabled = !micOn;
    await participant.setMicrophoneEnabled(enabled);
    setMicOn(enabled);
  };

  const toggleCam = async () => {
    const enabled = !camOn;
    await participant.setCameraEnabled(enabled);
    setCamOn(enabled);
  };

  const toggleShare = async () => {
    if (shareOn) {
      await participant.stopScreenShare();
      setShareOn(false);
    } else {
      await participant.startScreenShare();
      setShareOn(true);
    }
  };

  const leaveRoom = () => {
    room.disconnect();
  };

  return (
    <div className="w-full h-[68px] bg-gray-900 text-white relative flex items-center justify-between px-4 pb-2 pt-4">
      {/* <div className="flex gap-2">
        <IconButton icon={faCode} label="Coding" />
        <IconButton icon={faChalkboard} label="Board" />
      </div> */}
      {/* We can either choose to use the custom control, I made using the our design or the default */}
      {/* <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
        <IconButton
          onClick={toggleMic}
          icon={micOn ? faMicrophone : faMicrophoneSlash}
          label="Mic"
        />
          <IconButton
          onClick={toggleCam}
            icon={camOn ? faVideo : faVideoSlash}
            label="Camera"
          />
          <IconButton
          onClick={toggleShare}
            icon={shareOn ? faStopCircle : faArrowUpFromBracket}
            label="Share"
          />
        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center"
        >
          <FontAwesomeIcon icon={faPhoneSlash} className="mr-1" />
          Leave
        </button>
      </div> */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
        <ControlBar variation="minimal" />
      </div>
      <div className="flex gap-2">
        <IconButton
          icon={faInfo}
          label="Show Stats"
          onClick={() => {
            console.log("Show stats clicked");
          }}
        />
        {/* <IconButton icon={faLightbulb} label="Guide" />
        <IconButton icon={faClipboardCheck} label="Evaluate" />
        <IconButton icon={faMessage} label="Chat" />
        <IconButton icon={faUsers} label="People" /> */}
      </div>
    </div>
  );
};

export default Controls;
