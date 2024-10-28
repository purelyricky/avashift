// DoughnutChartStudent.tsx
"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChartStudent = ({ projects }: DoughnutChartStudentProps) => {
  const projectNames = projects.map((p) => p.projectName);
  const earnings = projects.map((p) => p.totalEarnings);

  const data = {
    datasets: [
      {
        label: 'Projects',
        data: earnings,
        backgroundColor: ['#0747b6', '#2265d8', '#2f91fa'] 
      }
    ],
    labels: projectNames
  }

  return <Doughnut 
    data={data} 
    options={{
      cutout: '60%',
      plugins: {
        legend: {
          display: false
        }
      }
    }}
  />
}

export default DoughnutChartStudent