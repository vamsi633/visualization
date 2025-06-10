"use client"; // This directive is still needed in JS for client components

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, // Import ChartJS
  CategoryScale, // Import CategoryScale for X-axis
  LinearScale, // Import LinearScale for Y-axis
  BarElement, // Import BarElement for Bar Charts
  Tooltip,
  Legend,
  Title, // Import Title
} from "chart.js";
// ChartData and ChartOptions imports are removed as they are TypeScript-specific.

// Register the necessary Chart.js components for Bar Chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

// The interface for props is removed in JavaScript
const TopChemicalsBarChart = ({ data }) => {
  const options = { // Type annotation ChartOptions<"bar"> is removed
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
        text: "Top 10 Most Studied Chemicals",
        color: "white",
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            const value = context.parsed; // Type cast 'as unknown as number' is removed
            label += `${value} studies`;
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
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
    <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md w-full max-w-2xl h-96 flex items-center justify-center">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopChemicalsBarChart;