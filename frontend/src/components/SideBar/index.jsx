import React from "react";
import Chart from "../Chart";

const Sidebar = () => {
  return (
    <div className="w-[624px] h-full bg-gray-200 dark:bg-gray-800 p-4 overflow-y-auto">
      {/* Add your sidebar content here */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Sidebar Content
      </h2>
      {/* Example content */}
      <div className="space-y-2">
        <div className="p-3 bg-white dark:bg-gray-700 rounded shadow">Item 1</div>
        <div className="p-3 bg-white dark:bg-gray-700 rounded shadow">Item 2</div>
        <div className="p-3 bg-white dark:bg-gray-700 rounded shadow">Item 3</div>
      </div>
    </div>
  );
};

export default Sidebar;
