import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function StaffDashboard() {
  const [stats, setStats] = useState({ total_students: 0, avg_score: 0, high_risk_count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/exam/analytics/staff/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.post('/exam/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message || 'CSV Uploaded & ML Pipeline Executed Successfully!');
      fetchStats();
    } catch (err) {
      alert('Failed to upload CSV. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#818cf8', marginBottom: '20px' }}>Faculty Analytics Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.total_students}</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Class Average Score</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#34d399' }}>{stats.avg_score}%</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>High Risk Students</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f87171' }}>{stats.high_risk_count}</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px' }}>
        <h3>Upload Student Marksheet (CSV)</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '15px' }}>Upload a `.csv` file containing: <code>student_id, score, attendance</code></p>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          disabled={loading}
          style={{ color: '#fff', backgroundColor: '#334155', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
        />
        {loading && <span style={{ marginLeft: '15px', color: '#818cf8' }}>Processing ML models...</span>}
      </div>
    </div>
  );
}

export default StaffDashboard;