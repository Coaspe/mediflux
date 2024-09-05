import React from "react";

type WorkInProgressProps = {
  message?: string; // 선택적인 메시지
};

const WorkInProgress: React.FC<WorkInProgressProps> = ({ message }) => {
  return (
    <div className="flex w-full h-full max-w-[700px] max-h-[400px] flex-col items-center justify-center p-6 bg-red-100 border border-red-300 rounded-lg text-red-800">
      <h1 className="text-3xl font-bold mb-4">🚧 Under Construction 🚧</h1>
      <p className="text-lg">{message || "This feature is currently under development. Please check back later!"}</p>
    </div>
  );
};

export default WorkInProgress;
