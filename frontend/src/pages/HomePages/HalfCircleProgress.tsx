import React, { useEffect, useState } from "react";

interface HalfCircleProgressProps {
  percentage: number; // 0 - 100
  size?: number;      // width/height of SVG
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}

const HalfCircleProgress: React.FC<HalfCircleProgressProps> = ({
  percentage,
  size = 150,
  strokeWidth = 15,
  color = "#3b82f6", // Tailwind blue-500
  bgColor = "#e5e7eb", // Tailwind gray-200
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half-circle
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = percentage / 60; // animate in ~1 second
    const interval = setInterval(() => {
      start += increment;
      if (start >= percentage) {
        start = percentage;
        clearInterval(interval);
      }
      setProgress(start);
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [percentage]);

  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <svg width={size} height={size / 2}>
      {/* Background half circle */}
      <path
        d={`
          M ${strokeWidth / 2},${size / 2}
          A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${size / 2}
        `}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Progress half circle */}
      <path
        d={`
          M ${strokeWidth / 2},${size / 2}
          A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${size / 2}
        `}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
      />

      {/* Percentage text */}
      <text
        x="50%"
        y="80%"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill="#111827" // Tailwind gray-900
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default HalfCircleProgress;
