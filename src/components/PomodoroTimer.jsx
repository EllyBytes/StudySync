import { useState, useEffect } from 'react';
import axios from 'axios';

function PomodoroTimer({ subjects = [] }) { // Default prop to empty array
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      if (!isBreak) {
        // End of work session
        setIsBreak(true);
        setTime(5 * 60); // 5-minute break
        setSessionsCompleted(sessions => sessions + 1);
        if (selectedSubjectId) {
          updateHoursStudied(selectedSubjectId);
        }
      } else {
        // End of break
        setIsBreak(false);
        setTime(25 * 60); // Back to 25-minute work session
      }
    }
    return () => clearInterval(interval);
  }, [isActive, time, isBreak, selectedSubjectId]);

  const updateHoursStudied = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      const subject = subjects.find(s => s._id === subjectId);
      if (!subject) return;
      const newHoursStudied = (subject.hoursStudied || 0) + 25 / 60; // 25 minutes
      await axios.put(
        `http://localhost:5000/api/subjects/${subjectId}`,
        { hoursStudied: newHoursStudied },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error updating hours studied:', err.message);
    }
  };

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTime(25 * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pomodoro Timer</h2>
      {subjects.length === 0 ? (
        <p className="text-gray-500 mb-4">No subjects available. Add a subject to start.</p>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => ( // Line 152: Safe with subjects as empty array
              <option key={subject._id} value={subject._id}>
                {subject.name} (Studied: {(subject.hoursStudied || 0).toFixed(2)}h / {subject.hours}h)
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isBreak ? 'Break Time' : 'Work Time'}: {formatTime(time)}
        </p>
        <p className="text-sm text-gray-600 mb-4">Sessions Completed: {sessionsCompleted}</p>
        <div className="space-x-2">
          <button
            onClick={startTimer}
            disabled={isActive || !selectedSubjectId}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Start
          </button>
          <button
            onClick={pauseTimer}
            disabled={!isActive}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 disabled:bg-gray-300"
          >
            Pause
          </button>
          <button
            onClick={resetTimer}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;