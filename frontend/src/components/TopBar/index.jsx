import React from "react";
import IconButton from "../IconButton";
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
    <div className="p-4 pb-3 bg-gray-900 dark:bg-gray-900 border-b h-[68px] flex items-center justify-between text-amber-50">
      <div className="flex items-center gap-3">
        {/* <div className="h-8 w-[77px] flex items-center justify-start gap-1">
          <FontAwesomeIcon
            icon={faCircleDot}
            className="text-red-600 text-base"
          />
          <span className="text-white text-sm leading-none">00:00</span>
        </div>

        <div className="h-8 w-[413px] flex items-center overflow-hidden">
          <h2 className="text-white text-lg font-semibold whitespace-nowrap overflow-ellipsis leading-none">
            Interview for Room A
          </h2>
        </div> */}
      </div>

      {/* <div className="flex gap-3">
        <IconButton icon={faChartLine} label="Progress" />
        <IconButton icon={faBriefcase} label="Job Desc." />
        <IconButton icon={faFileAlt} label="Resume" />
        <IconButton icon={faUser} label="Profile" />
      </div> */}
    </div>
  );
};

export default TopBar;
