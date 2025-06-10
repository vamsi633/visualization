"use client"; // This directive is still needed in JS for client components

import React from "react";
import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale, // Required for PolarArea and Radar charts
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
// ChartData and ChartOptions imports are removed as they are TypeScript-specific.

// Register necessary Chart.js components for PolarArea Chart
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend, Title);

// The interface for props is removed in JavaScript
const TopTechniquesPolarAreaChart = ({ data }) => {
  const options = { // Type annotation ChartOptions<"polarArea"> is removed
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "Top Exposure Techniques (Polar View)",
        color: "white",
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            const value = context.parsed.r; // Type cast 'as number' is removed
            label += `${value} studies`;
            return label;
          },
        },
      },
    },
    scales: {
      r: {
        // Radial scale specific to PolarArea
        grid: {
          color: "rgba(255, 255, 255, 0.2)", // Grid lines on radial scale
        },
        ticks: {
          color: "white", // Tick labels on radial scale
          backdropColor: "rgba(0,0,0,0)", // Transparent background for ticks
        },
      },
    },
  };

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md w-full max-w-lg h-96 flex items-center justify-center">
      <PolarArea data={data} options={options} />
    </div>
  );
};

export default TopTechniquesPolarAreaChart;