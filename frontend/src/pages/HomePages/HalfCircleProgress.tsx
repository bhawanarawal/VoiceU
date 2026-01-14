import React, { useEffect, useState } from "react";

interface HalfCircleProgressProps {
  percentage: number; // 0 - 100
  size?: number; // width/height of SVG
  strokeWidth?: number;
  colorStart?: string; // gradient start
  colorEnd?: string; // gradient end
  bgColor?: string;
}

const HalfCircleProgress: React.FC<HalfCircleProgressProps> = ({
  percentage,
  size = 150,
  strokeWidth = 15,
  colorStart = "#3b82f6", // Tailwind blue-500
  colorEnd = "#8b5cf6", // Tailwind purple-500
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
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colorStart} />
          <stop offset="100%" stopColor={colorEnd} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={colorEnd} />
        </filter>
      </defs>

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

      {/* Gradient progress half circle */}
      <path
        d={`
          M ${strokeWidth / 2},${size / 2}
          A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${size / 2}
        `}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        filter="url(#glow)"
      />

      {/* Percentage text */}
      <text
        x="50%"
        y="80%"
        textAnchor="middle"
        fontSize={size * 0.18}
        fontWeight="bold"
        fill="#111827"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default HalfCircleProgress;
