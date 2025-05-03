// components/IconWithLabel.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IconWithLabel = ({ icon, label }) => {
  return (
    <div className="h-[52px] w-[64px] bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
      <FontAwesomeIcon icon={icon} className="text-xl mb-1" />
      <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
};

export default IconWithLabel;
