import { useState, useEffect } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import axios from 'axios';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

function AnalysisDashboard({ subjects, schedule }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [sortBy, setSortBy] = useState('subject'); // 'subject' or 'hours'

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const res = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err.message);
      setReports([]);
      setError(err.message || 'Failed to fetch analysis reports. The server might be down or the endpoint might be incorrect.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const currentReport = reports.find(report => report.month === selectedMonth) || {
    hoursStudied: [],
    completionPercentage: [],
    dailyHours: [],
    consistencyScore: 0,
  };

  // Sort data for existing charts
  const sortedHoursStudied = [...currentReport.hoursStudied].sort((a, b) => {
    if (sortBy === 'hours') {
      return b.hours - a.hours;
    }
    return a.subject.localeCompare(b.subject);
  });

  const sortedCompletion = [...currentReport.completionPercentage].sort((a, b) => {
    if (sortBy === 'hours') {
      const hoursA = currentReport.hoursStudied.find(item => item.subject === a.subject)?.hours || 0;
      const hoursB = currentReport.hoursStudied.find(item => item.subject === b.subject)?.hours || 0;
      return hoursB - hoursA;
    }
    return a.subject.localeCompare(b.subject);
  });

  // Daily Study Trend Data
  const dailyHoursData = {
    labels: currentReport.dailyHours.map(item => item.date.split('-')[2]), // Day of the month
    datasets: [
      {
        label: 'Hours Studied Per Day',
        data: currentReport.dailyHours.map(item => item.hours),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Subject Focus Distribution (across all months)
  const subjectFocusData = () => {
    const subjectHoursMap = {};
    reports.forEach(report => {
      report.hoursStudied.forEach(({ subject, hours }) => {
        subjectHoursMap[subject] = (subjectHoursMap[subject] || 0) + hours;
      });
    });
    return {
      labels: Object.keys(subjectHoursMap),
      datasets: [
        {
          label: 'Subject Focus Distribution',
          data: Object.values(subjectHoursMap),
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          borderColor: ['#1E40AF', '#047857', '#B45309', '#B91C1C', '#6D28D9'],
          borderWidth: 1,
        },
      ],
    };
  };

  // Consistency Score (simulated gauge with Pie chart)
  const consistencyData = {
    labels: ['Consistency Score', 'Remaining'],
    datasets: [
      {
        label: 'Consistency',
        data: [currentReport.consistencyScore, 100 - currentReport.consistencyScore],
        backgroundColor: ['#10B981', '#E5E7EB'],
        borderColor: ['#047857', '#D1D5DB'],
        borderWidth: 1,
      },
    ],
  };

  const hoursStudiedData = {
    labels: sortedHoursStudied.map(item => item.subject),
    datasets: [
      {
        label: 'Hours Studied',
        data: sortedHoursStudied.map(item => item.hours),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const completionData = {
    labels: sortedCompletion.map(item => item.subject),
    datasets: [
      {
        label: 'Completion Percentage',
        data: sortedCompletion.map(item => item.percentage),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#1E40AF', '#047857', '#B45309', '#B91C1C'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}${label.includes('Percentage') || label.includes('Consistency') ? '%' : ' hours'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of Month',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Dashboard</h2>
      {loading ? (
        <p className="text-gray-500">Loading reports...</p>
      ) : error ? (
        <div className="text-red-500 mb-4">
          <p>{error}</p>
          <button
            onClick={fetchReports}
            className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">No reports available. Complete a Pomodoro session to generate reports.</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500"
              >
                {reports.map(report => (
                  <option key={report._id} value={report.month}>
                    {new Date(report.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 mt-4 sm:mt-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="subject">Subject Name</option>
                <option value="hours">Hours Studied</option>
              </select>
            </div>
          </div>
          {currentReport.hoursStudied.length === 0 ? (
            <p className="text-gray-500">No data available for {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Hours Studied</h3>
                <Bar data={hoursStudiedData} options={chartOptions} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Completion Percentage</h3>
                <Pie data={completionData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Daily Study Trend</h3>
                <Line data={dailyHoursData} options={lineChartOptions} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Subject Focus Distribution</h3>
                <Doughnut data={subjectFocusData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Consistency Score</h3>
                <Pie data={consistencyData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AnalysisDashboard;