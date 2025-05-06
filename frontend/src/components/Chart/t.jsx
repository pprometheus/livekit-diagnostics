import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
} from "chart.js";
import streamingPlugin from "chartjs-plugin-streaming"; // Import the streaming plugin
import "chartjs-adapter-moment"; // Import the moment adapter for Chart.js
import moment from "moment";

// Register required components and the streaming plugin
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
  streamingPlugin // Register the streaming plugin
);

const chartColors = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

const data = {
  datasets: [
    {
      label: "Dataset 1 (linear interpolation)",
      backgroundColor: "rgba(255, 99, 132, 0.5)", // Use RGBA directly
      borderColor: chartColors.red,
      fill: false,
      lineTension: 0,
      borderDash: [8, 4],
      data: [],
    },
  ],
};

const options = {
  elements: {
    line: {
      tension: 0.5,
    },
  },
  scales: {
    x: {
      type: "realtime", // Use the realtime scale provided by the streaming plugin
      realtime: {
        onRefresh: function (chart) {
          chart.data.datasets[0].data.push({
            x: moment(),
            y: Math.random(),
          });
        },
        delay: 3000,
        time: {
          displayFormat: "h:mm",
        },
      },
      ticks: {
        maxRotation: 0,
        minRotation: 0,
        stepSize: 1,
        maxTicksLimit: 30,
        source: "auto",
        autoSkip: true,
        callback: function (value) {
          return moment(value, "HH:mm:ss").format("mm:ss");
        },
      },
    },
    y: {
      ticks: {
        beginAtZero: true,
        max: 1,
      },
    },
  },
};

const Pp = () => {
  return (
    <div className="App">
      <Line data={data} options={options} />
    </div>
  );
};

export default Pp;
