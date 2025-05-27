import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios';

function SubjectList() { // Removed props (subjects, onDelete, onUpdate) as component will manage its own state
  const [subjects, setSubjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', hours: '', deadline: '' });
  const [error, setError] = useState('');

  // useEffect for fetching subjects (from the first snippet)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view subjects.');
          return;
        }
        const res = await axios.get('http://localhost:5000/api/subjects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(res.data || []);
      } catch (err) {
        console.error('Error fetching subjects:', err.message);
        setError('Failed to fetch subjects. Please try again.');
      }
    };
    fetchSubjects();
  }, []); // Empty dependency array means this runs once on component mount

  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setEditForm({
      name: subject.name,
      hours: subject.hours,
      deadline: subject.deadline ? new Date(subject.deadline).toISOString().slice(0, 10) : '',
    });
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', hours: '', deadline: '' });
    setError('');
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name || !editForm.hours) {
      setError('Please fill in all required fields.');
      return;
    }
    if (editForm.hours <= 0) {
      setError('Hours must be greater than 0.');
      return;
    }

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        const token = localStorage.getItem('token');
        const updatedSubject = {
          name: editForm.name,
          hours: Number(editForm.hours),
          hoursStudied: subjects.find(s => s._id === id).hoursStudied,
          deadline: editForm.deadline || undefined,
        };
        const res = await axios.put(
          `http://localhost:5000/api/subjects/${id}`,
          updatedSubject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update the subjects state directly
        setSubjects(subjects.map(sub => (sub._id === id ? res.data : sub)));
        setEditingId(null);
        setEditForm({ name: '', hours: '', deadline: '' });
        setError('');
        success = true;
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err.message);
        attempt++;
        if (attempt === maxRetries) {
          setError('Failed to update subject after multiple attempts. Please try again later.');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const handleDelete = async (id) => {
    const subject = subjects.find(s => s._id === id);
    if (!subject) {
      alert('Subject not found in the list. Please refresh the page and try again.');
      return;
    }

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found.');
        await axios.delete(`http://localhost:5000/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Update the subjects state directly
        setSubjects(subjects.filter(s => s._id !== id));
        success = true;
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err.message);
        attempt++;
        let errorMessage = 'Failed to delete subject after multiple attempts. Please try again later.';
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = 'Subject not found on the server. It may have been deleted. Please refresh the page.';
          } else if (err.response.status === 401) {
            errorMessage = 'Unauthorized. Please log in again and try deleting the subject.';
          }
        }
        if (attempt === maxRetries) {
          alert(errorMessage);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Subjects</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {subjects.length === 0 ? (
        <p className="text-gray-500">No subjects added yet.</p>
      ) : (
        <ul className="space-y-4">
          {subjects.map(subject => (
            <li key={subject._id} className="p-4 border rounded-lg">
              {editingId === subject._id ? (
                <div className="space-y-4">
                  {error && <p className="text-red-500">{error}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours</label>
                    <input
                      type="number"
                      value={editForm.hours}
                      onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                      className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                    <input
                      type="date"
                      value={editForm.deadline}
                      onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                      className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(subject._id)}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {subject.name} - {subject.hours} hours (Studied: {(subject.hoursStudied || 0).toFixed(2)} hours)
                    </p>
                    {subject.deadline && (
                      <p className="text-sm text-gray-600">
                        Deadline: {new Date(subject.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubjectList;