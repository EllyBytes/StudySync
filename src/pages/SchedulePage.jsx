import { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarView from '../components/CalendarView';

function SchedulePage({ subjects: propSubjects }) {
  const [subjectSchedules, setSubjectSchedules] = useState([]);
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState(propSubjects || []);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    console.log('Subject schedules state updated:', subjectSchedules);
  }, [subjectSchedules]);

  const fetchSubjects = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/subjects', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const fetchedSubjects = res.data || [];
      setSubjects(fetchedSubjects);
      console.log('Fetched subjects:', fetchedSubjects);
      if (fetchedSubjects.length === 0) {
        setError('No subjects found. Please add subjects before generating a schedule.');
      }
      return fetchedSubjects;
    } catch (err) {
      console.error('Error fetching subjects:', err.message, err.response?.data);
      setError('Failed to fetch subjects. Please ensure the server is running.');
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access your schedule.');
          return;
        }
        const [scheduleRes] = await Promise.all([
          axios.get('http://localhost:5000/api/schedules', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
        ]);
        setSubjectSchedules(scheduleRes.data.subjectSchedules || []);
        setUnavailableTimes(scheduleRes.data.unavailableTimes || []);
        await fetchSubjects(token);
      } catch (err) {
        console.error('Error fetching data:', err.message, err.response?.data);
        setError('Failed to fetch schedule. Please try logging in again or ensure the server is running.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (propSubjects && propSubjects.length > 0) {
      setSubjects(propSubjects);
    }
  }, [propSubjects]);

  const addUnavailableTime = () => {
    setUnavailableTimes([...unavailableTimes, { date: '', startTime: '', endTime: '' }]);
  };

  const updateUnavailableTime = (index, field, value) => {
    const newUnavailableTimes = [...unavailableTimes];
    newUnavailableTimes[index][field] = value;
    setUnavailableTimes(newUnavailableTimes);
  };

  const removeUnavailableTime = (index) => {
    setUnavailableTimes(unavailableTimes.filter((_, i) => i !== index));
  };

  const handleSubjectToggle = (subjectName) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectName)
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName]
    );
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const fetchSchedule = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/schedules', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setSubjectSchedules(res.data.subjectSchedules || []);
      setUnavailableTimes(res.data.unavailableTimes || []);
    } catch (err) {
      console.error('Error fetching schedule after save:', err.message, err.response?.data);
      setError('Failed to fetch updated schedule.');
    }
  };

  const generateSchedule = async () => {
    console.log('Starting schedule generation...');
    let token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access your schedule.');
      console.log('Error: No token found');
      return;
    }

    const freshSubjects = await fetchSubjects(token);

    if (!startDate || !endDate) {
      setError('Please select a start and end date.');
      console.log('Error: Start or end date missing');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date.');
      console.log('Error: Invalid date range');
      return;
    }

    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject to schedule.');
      console.log('Error: No subjects selected');
      return;
    }

    const validUnavailableTimes = unavailableTimes.filter(ut => {
      if (!ut.date || !ut.startTime || !ut.endTime) {
        return false;
      }
      const startMinutes = timeToMinutes(ut.startTime);
      const endMinutes = timeToMinutes(ut.endTime);
      return startMinutes < endMinutes;
    });
    console.log('Valid unavailable times:', validUnavailableTimes);

    console.log('Raw subjects:', freshSubjects);

    for (const subjectName of selectedSubjects) {
      const subjectData = freshSubjects.find(s => s.name === subjectName);
      if (!subjectData) continue;

      const hours = Number(subjectData.hours) || 0;
      const hoursStudied = Number(subjectData.hoursStudied) || 0;
      const remainingHours = hours - hoursStudied;
      if (remainingHours <= 0) {
        console.log(`Subject ${subjectName} has no remaining hours to schedule.`);
        continue;
      }

      const subjectWithRemaining = {
        ...subjectData,
        remainingHours,
        deadline: subjectData.deadline ? new Date(subjectData.deadline) : null,
      };

      console.log(`Processing subject ${subjectName}: remainingHours=${remainingHours}`);

      const totalRemainingHours = subjectWithRemaining.remainingHours;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (days <= 0) {
        setError('Invalid date range.');
        console.log('Error: Invalid date range (days <= 0)');
        return;
      }
      console.log(`Subject ${subjectName} - Total remaining hours: ${totalRemainingHours}, Days: ${days}`);

      const dailyAvailability = [];
      let totalAvailableMinutes = 0;
      for (let d = 0; d < days; d++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + d);
        const dateStr = currentDate.toISOString().slice(0, 10);

        let availableSlots = [{ start: timeToMinutes('08:00'), end: timeToMinutes('20:00') }];

        const dayUnavailable = validUnavailableTimes.filter(ut => ut.date === dateStr);
        dayUnavailable.forEach(({ startTime, endTime }) => {
          if (!startTime || !endTime) return;
          const unavailableStart = timeToMinutes(startTime);
          const unavailableEnd = timeToMinutes(endTime);
          availableSlots = availableSlots
            .map(slot => {
              if (unavailableEnd <= slot.start || unavailableStart >= slot.end) {
                return [slot];
              }
              const newSlots = [];
              if (unavailableStart > slot.start) {
                newSlots.push({ start: slot.start, end: unavailableStart });
              }
              if (unavailableEnd < slot.end) {
                newSlots.push({ start: unavailableEnd, end: slot.end });
              }
              return newSlots;
            })
            .flat();
        });

        const availableMinutes = availableSlots.reduce((sum, slot) => sum + (slot.end - slot.start), 0);
        totalAvailableMinutes += availableMinutes;
        dailyAvailability.push({ date: dateStr, availableSlots, availableMinutes });
      }
      console.log(`Subject ${subjectName} - Daily availability:`, dailyAvailability);

      if (totalAvailableMinutes === 0) {
        setError(`No available time slots in the selected date range for ${subjectName}.`);
        console.log('Error: No available time slots');
        return;
      }

      const minutesPerSubject = {
        ...subjectWithRemaining,
        totalMinutes: (subjectWithRemaining.remainingHours * 60),
        minutesScheduled: 0,
      };

      const newSchedule = dailyAvailability.map(day => {
        const { date, availableSlots, availableMinutes } = day;
        const dayMinutesToSchedule = Math.round((availableMinutes / totalAvailableMinutes) * (totalRemainingHours * 60));
        if (dayMinutesToSchedule <= 0) return { date, slots: [] };

        const slots = [];
        let remainingDayMinutes = dayMinutesToSchedule;

        availableSlots.sort((a, b) => a.start - b.start);

        for (const slot of availableSlots) {
          let currentTime = slot.start;
          while (currentTime < slot.end && remainingDayMinutes > 0) {
            const subjectToSchedule = minutesPerSubject.totalMinutes > minutesPerSubject.minutesScheduled ? minutesPerSubject : null;
            if (!subjectToSchedule) break;

            const maxSlotMinutes = 2 * 60;
            const remainingSlotMinutes = slot.end - currentTime;
            const remainingSubjectMinutes = subjectToSchedule.totalMinutes - subjectToSchedule.minutesScheduled;
            let slotMinutes = Math.min(maxSlotMinutes, remainingSlotMinutes, remainingSubjectMinutes, remainingDayMinutes);

            if (slotMinutes < 30) break;

            const startTime = minutesToTime(currentTime);
            currentTime += slotMinutes;
            const endTime = minutesToTime(currentTime);

            slots.push({
              startTime,
              endTime,
            });

            subjectToSchedule.minutesScheduled += slotMinutes;
            remainingDayMinutes -= slotMinutes;

            if (currentTime < slot.end && remainingDayMinutes > 0) {
              currentTime += 15;
            }
          }
        }

        return { date, slots };
      });
      console.log(`Generated schedule for ${subjectName}:`, newSchedule);

      const maxRetries = 3;
      let attempt = 0;
      let success = false;
      let lastError = '';

      console.log('Data to save for subject:', { subject: subjectName, startDate, endDate, schedule: newSchedule, unavailableTimes: validUnavailableTimes });

      while (attempt < maxRetries && !success) {
        try {
          const response = await axios.post(
            'http://localhost:5000/api/schedules',
            { 
              subject: subjectName,
              startDate, 
              endDate, 
              schedule: newSchedule, 
              unavailableTimes: validUnavailableTimes 
            },
            { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            }
          );
          console.log(`Schedule saved successfully for ${subjectName}:`, response.data);
          success = true;
        } catch (err) {
          console.error(`Attempt ${attempt + 1} failed for ${subjectName}:`, err.message, 'Response data:', err.response?.data);
          if (err.response && err.response.status === 400) {
            if (err.response.data.error === 'Invalid token') {
              setError('Your session has expired. Please log in again.');
              console.log('Error: Invalid token detected');
              return;
            } else {
              lastError = `Failed to save schedule for ${subjectName}: ${err.response.data.error || err.message}${err.response.data.details ? ' - ' + err.response.data.details : ''}`;
            }
          } else {
            lastError = `Failed to save schedule for ${subjectName}: ${err.message}`;
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!success) {
        setError(lastError || `Failed to save schedule for ${subjectName} after multiple attempts.`);
        console.log('Error:', lastError);
        return;
      }
    }

    await fetchSchedule(token);
    setError('');
    console.log('All selected subjects scheduled successfully');
  };

  // Combine all subject schedules for CalendarView, grouping by date
  const combinedSchedule = subjectSchedules
    .flatMap(subjectSchedule =>
      subjectSchedule.schedule.map(day => ({
        date: day.date,
        slots: day.slots.map(slot => ({
          subject: subjectSchedule.subject,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      }))
    )
    .filter(day => day.slots.length > 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Schedule</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Set Date Range</h2>
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Set Unavailable Times</h2>
        {unavailableTimes.map((ut, index) => (
          <div key={index} className="flex space-x-4 mb-2 items-center">
            <input
              type="date"
              value={ut.date}
              onChange={(e) => updateUnavailableTime(index, 'date', e.target.value)}
              className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={ut.startTime}
              onChange={(e) => updateUnavailableTime(index, 'startTime', e.target.value)}
              className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={ut.endTime}
              onChange={(e) => updateUnavailableTime(index, 'endTime', e.target.value)}
              className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => removeUnavailableTime(index)}
              className="bg-red-500 text-white p-3 rounded hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addUnavailableTime}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors mt-2"
        >
          Add Unavailable Time
        </button>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Subjects to Schedule</h2>
        {subjects.length === 0 ? (
          <p className="text-gray-500">No subjects available. Please add subjects first.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {subjects.map(subject => (
              <label key={subject.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.name)}
                  onChange={() => handleSubjectToggle(subject.name)}
                  className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{subject.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={generateSchedule}
        className="bg-green-500 text-white p-3 rounded hover:bg-green-600 transition-colors mb-6"
      >
        Generate Schedule
      </button>
      <CalendarView schedule={combinedSchedule} />
    </div>
  );
}

export default SchedulePage;