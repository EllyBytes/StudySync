import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ProgressChart({ subjects }) {
  const data = {
    labels: subjects.map(subject => subject.name),
    datasets: [
      {
        label: 'Hours Studied',
        data: subjects.map(subject => subject.hoursStudied),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Study Progress' },
    },
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold">Progress Chart</h2>
      <Bar data={data} options={options} />
    </div>
  );
}

export default ProgressChart;