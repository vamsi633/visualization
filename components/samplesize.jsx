"use client"; // This directive is still needed in JS for client components

import React from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS, // Import ChartJS
  LinearScale,
  PointElement, // Import PointElement for Scatter Plots
  Tooltip,
  Legend,
  Title,
} from "chart.js";
// ChartData and ChartOptions imports are removed as they are TypeScript-specific.

// Register necessary Chart.js components for Scatter Plot
ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

// The interface for props is removed in JavaScript
const SampleSizeDurationScatterPlot = ({ data }) => {
  const options = { // Type annotation ChartOptions<"scatter"> is removed
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
        text: "Sample Size vs. Tox Exposure Duration (Minutes)",
        color: "white",
        font: {
          size: 18,
        },
      },
      tooltip: {
        // Add/Modify tooltip for Scatter chart
        callbacks: {
          label: function (context) {
            const dataPoint = context.parsed; // Type cast 'as { x: number; y: number }' is removed
            return `Duration: ${dataPoint.x.toFixed(
              2
            )} min, Sample Size: ${dataPoint.y.toFixed(0)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear", // Scatter plots typically use linear scales for both axes
        position: "bottom",
        title: {
          display: true,
          text: "Tox Exposure Duration (Minutes)",
          color: "white",
        },
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Sample Size",
          color: "white",
        },
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md w-full max-w-3xl h-96 flex items-center justify-center">
      <Scatter data={data} options={options} />
    </div>
  );
};

export default SampleSizeDurationScatterPlot;