// components/IconWithLabel.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IconButton = ({ icon, label,onClick }) => {
  return (
    <button onClick={onClick} className="h-[52px] w-[64px] bg-gray-100 dark:bg-gray-900 rounded-md flex flex-col hover:cursor-pointer hover:dark:bg-gray-700 items-center justify-center disabled:opacity-50 cursor-not-allowed">
      <FontAwesomeIcon icon={icon} className="text-xl mb-1" />
      <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
};

export default IconButton;
