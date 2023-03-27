import React from "react";

const LoadingCircle: React.FC = () => {
  return (
    <div className="relative">
      <div className="border-r-black animate-spin inline-block w-8 h-8 border-4 rounded-full  bottom-0 right-0 z-10"></div>
    </div>
  );
};
export default LoadingCircle;
