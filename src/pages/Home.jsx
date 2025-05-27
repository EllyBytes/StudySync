import { useState, useEffect } from 'react';
import axios from 'axios';
import SubjectForm from '../components/SubjectForm';
import SubjectList from '../components/SubjectList';

function Home() {
  const [subjects, setSubjects] = useState([]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (err) {
      console.error('Error fetching subjects:', err.message);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const addSubject = async (subject) => {
    setSubjects([...subjects, subject]);
    await fetchSubjects();
  };

  const deleteSubject = async (id) => {
    setSubjects(subjects.filter(subject => subject._id !== id));
    await fetchSubjects();
  };

  const updateSubject = async (updatedSubject) => {
    setSubjects(subjects.map(subject => 
      subject._id === updatedSubject._id ? updatedSubject : subject
    ));
    await fetchSubjects();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Study Planner</h1>
      <SubjectForm onAddSubject={addSubject} />
      <SubjectList 
        subjects={subjects} 
        onDelete={deleteSubject} 
        onUpdate={updateSubject} 
      />
    </div>
  );
}

export default Home;