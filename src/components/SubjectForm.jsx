import { useState } from 'react';
import axios from 'axios';

function SubjectForm({ onAddSubject }) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !hours) {
      setError('Please fill in all required fields.');
      return;
    }
    if (hours <= 0) {
      setError('Hours must be greater than 0.');
      return;
    }

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found.');
        const res = await axios.post(
          'http://localhost:5000/api/subjects',
          { name, hours: Number(hours), deadline: deadline || undefined },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onAddSubject(res.data);
        setName('');
        setHours('');
        setDeadline('');
        setError('');
        success = true;
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err.message);
        attempt++;
        if (attempt === maxRetries) {
          setError('Failed to add subject after multiple attempts. Please try again later.');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add Subject</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Mathematics"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours</label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 10"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors w-full disabled:bg-gray-400"
      >
        {loading ? 'Adding...' : 'Add Subject'}
      </button>
    </form>
  );
}

export default SubjectForm;