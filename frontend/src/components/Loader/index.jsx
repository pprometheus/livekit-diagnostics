import React from "react";
const Loader = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 dark:bg-gray-900" data-testid="loader">
      <div
        className="h-[68px] flex items-center justify-between px-4 
                  bg-gray-300 dark:bg-gray-700 animate-pulse"
      >
        <div className="w-36 h-5 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        <div className="w-20 h-5 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 m-4 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="w-[300px] m-4 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>

      <div
        className="h-[68px] flex items-center justify-between px-4 py-2 
                  bg-gray-300 dark:bg-gray-700 animate-pulse"
      >
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <div className="w-12 h-12 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <div className="w-12 h-12 rounded-full bg-gray-400 dark:bg-gray-600"></div>
        </div>
        <div className="w-28 h-5 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
};

export default Loader;
