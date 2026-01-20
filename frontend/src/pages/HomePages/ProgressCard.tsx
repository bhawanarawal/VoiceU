import React from "react";
import HalfCircleProgress from "./HalfCircleProgress";

interface ProgressCardProps {
  title: string;
  percentage: number;
  description?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  percentage,
  description,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md shadow-xl  p-7 flex flex-col items-center gap-5 ">
      <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
        {title}
      </h3>

      {description && (
        <p className="text-gray-600 text-center text-sm md:text-base">
          {description}
        </p>
      )}

      <HalfCircleProgress percentage={percentage} size={160} strokeWidth={18} />

      <div className="mt-2 text-gray-800 font-semibold text-lg md:text-xl"></div>
    </div>
  );
};

export default ProgressCard;
