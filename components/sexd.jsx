"use client"; // This directive is still needed in JS for client components

import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
// ChartData and ChartOptions imports are removed as they are TypeScript-specific.

// Register necessary Chart.js components for Doughnut Chart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// The interface for props is removed in JavaScript
const SexDistributionDoughnutChart = ({ data }) => {
  const options = { // Type annotation ChartOptions<"doughnut"> is removed
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
        text: "Distribution of Studies by Sex",
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
            const value = context.parsed; // Type cast 'as number' is removed
            const total = context.dataset.data.reduce(
              (a, b) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            label += `${value} studies (${percentage}%)`;
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md w-full max-w-md h-96 flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default SexDistributionDoughnutChart;