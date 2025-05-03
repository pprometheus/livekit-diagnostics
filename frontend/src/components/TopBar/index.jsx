import React from "react";
import IconWithLabel from "../IconLabel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faChartLine,
  faCircleDot,
  faClock,
  faFileAlt,
  faFolderOpen,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const TopBar = () => {
  return (
    <div className="p-4 pb-3 bg-white dark:bg-gray-900 border-b h-[68px] flex items-center justify-between text-amber-50">
      {/* Left side: Recording and Title */}
      <div className="flex items-center gap-3">
        {/* Recording + Time */}
        <div className="h-8 w-[77px] flex items-center justify-start gap-1">
          <FontAwesomeIcon
            icon={faCircleDot}
            className="text-red-600 text-base"
          />{" "}
          {/* Record icon */}
          <span className="text-white text-sm leading-none">02:15</span>
        </div>

        {/* Title */}
        <div className="h-8 w-[413px] flex items-center overflow-hidden">
          <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-ellipsis leading-none">
            Technical Interview for Lead Frontend Developer
          </h2>
        </div>
      </div>

      {/* Right side: Icon+Text Blocks */}
      <div className="flex gap-3">
        <IconWithLabel icon={faChartLine} label="Progress" />
        <IconWithLabel icon={faBriefcase} label="Job Desc." />
        <IconWithLabel icon={faFileAlt} label="Resume" />
        <IconWithLabel icon={faUser} label="Profile" />
      </div>
    </div>
  );
};

export default TopBar;
