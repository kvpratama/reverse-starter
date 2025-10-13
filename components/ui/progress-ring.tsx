import { HTMLAttributes } from "react";

interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  score: number;
  title?: string;
  size?: "sm" | "md" | "lg";
}

export default function ProgressRing({
  score,
  title,
  size = "md",
}: ProgressRingProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));

  let radius, stroke, fontSize, titleFontSize, containerSize;
  switch (size) {
    case "sm":
      radius = 16;
      stroke = 3;
      fontSize = "text-xs";
      titleFontSize = "text-[10px]";
      containerSize = "w-10 h-10";
      break;
    case "md":
      radius = 20;
      stroke = 4;
      fontSize = "text-sm";
      titleFontSize = "text-xs";
      containerSize = "w-12 h-12";
      break;
    case "lg":
      radius = 24;
      stroke = 5;
      fontSize = "text-base";
      titleFontSize = "text-sm";
      containerSize = "w-14 h-14";
      break;
  }

  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (normalizedScore / 100) * circumference;

  let color = "text-red-500";
  if (normalizedScore >= 90) {
    color = "text-green-500";
  } else if (normalizedScore >= 70) {
    color = "text-blue-500";
  } else if (normalizedScore >= 40) {
    color = "text-yellow-500";
  }

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerSize} space-y-1`}
    >
      <div className="relative w-full h-full">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="text-gray-200"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`${color} transition-all duration-300`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold ${fontSize}`}
        >
          {normalizedScore}%
        </div>
      </div>
      {title && (
        <div
          className={`text-center font-medium text-gray-600 ${titleFontSize}`}
        >
          {title}
        </div>
      )}
    </div>
  );
}
