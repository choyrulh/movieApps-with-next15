"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Person } from "@/app/person/page";

export const PopularityChart = ({ people }: { people: Person[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxPopularity = Math.max(...people.map((p) => p.popularity));
  const chartHeight = 400;
  const barWidth = 40;
  const spacing = 25;
  const gradientId = `popularity-gradient-${Math.random()
    .toString(16)
    .slice(2)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Popularity Distribution
      </h3>

      <div className="relative h-96 overflow-x-auto">
        <svg
          width={Math.max(800, people.length * (barWidth + spacing))}
          height={chartHeight}
          className="w-full h-full"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent, i) => {
            const y = chartHeight - 40 - (percent / 100) * (chartHeight - 60);
            return (
              <g key={i}>
                <line
                  x1="60"
                  x2="100%"
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  className="text-gray-300 dark:text-gray-600"
                />
                <text
                  x="50"
                  y={y + 4}
                  className="text-gray-500 dark:text-gray-400 text-sm"
                >
                  {Math.round((percent / 100) * maxPopularity)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {people.slice(0, 12).map((person, index) => {
            const barHeight =
              (person.popularity / maxPopularity) * (chartHeight - 60);
            const x = 80 + index * (barWidth + spacing);
            const y = chartHeight - 40 - barHeight;

            return (
              <g
                key={person.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background bar */}
                <rect
                  x={x}
                  y={chartHeight - 40}
                  width={barWidth}
                  height={chartHeight - 40}
                  fill="currentColor"
                  className="text-gray-100 dark:text-gray-700"
                  rx="4"
                />

                {/* Main bar */}
                <motion.rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#${gradientId})`}
                  rx="4"
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.05,
                    type: "spring",
                  }}
                />

                {/* Interactive overlay */}
                <rect
                  x={x - 5}
                  y={y - 10}
                  width={barWidth + 10}
                  height={barHeight + 20}
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* Name label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 20}
                  className="text-gray-600 dark:text-gray-300 text-xs font-medium"
                  textAnchor="middle"
                  transform={`rotate(35 ${x + barWidth / 2} ${
                    chartHeight - 20
                  })`}
                >
                  {person.name.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* Hover tooltip */}
          {hoveredIndex !== null && (
            <g
              transform={`translate(${
                80 + hoveredIndex * (barWidth + spacing)
              },0)`}
            >
              <motion.foreignObject
                x={-50}
                y={
                  chartHeight -
                  40 -
                  (people[hoveredIndex].popularity / maxPopularity) *
                    (chartHeight - 60) -
                  100
                }
                width={100}
                height={90}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-600 text-center">
                  <div className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                    {people[hoveredIndex].name}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                    Popularity Score
                  </div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    {people[hoveredIndex].popularity.toFixed(0)}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-gray-700 border-b border-r border-gray-100 dark:border-gray-600" />
                </div>
              </motion.foreignObject>
            </g>
          )}
        </svg>

        {/* Axis labels */}
        <div className="absolute left-0 bottom-8 -rotate-90 origin-left text-gray-500 dark:text-gray-400 text-sm font-medium">
          Popularity Score
        </div>
        <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">
          Celebrities
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-b from-purple-600 to-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Popularity Score
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Max Possible
          </span>
        </div>
      </div>
    </div>
  );
};

// export default PopularityChart
