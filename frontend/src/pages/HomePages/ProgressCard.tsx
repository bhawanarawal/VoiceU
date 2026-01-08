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
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center gap-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
      <HalfCircleProgress percentage={percentage} size={150} strokeWidth={15} />
    </div>
  );
};

export default ProgressCard;
