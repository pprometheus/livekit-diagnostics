import React from "react";

const Sidebar = ({ children }) => {
  return (
    <div className="flex flex-col gap-4 w-[624px] h-full bg-gray-200 dark:bg-gray-800 p-4 overflow-y-auto">
      {children}
    </div>
  );
};

export default Sidebar;
