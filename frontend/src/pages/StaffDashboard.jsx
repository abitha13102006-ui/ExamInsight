import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

function StaffDashboard() {
  const [stats, setStats] = useState({ total_students: 0, avg_score: 0, high_risk_count: 0, students: [] });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchStats = async () => {
    try {
      const res = await api.get('/exam/analytics/staff/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
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
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.post('/exam/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatusMsg({ type: 'success', text: res.data.message });
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'File upload failed. Ensure backend server is running.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#818cf8', marginBottom: '20px' }}>Faculty Analytics Dashboard</h1>

      {/* Summary Metrics Row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total_students}</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Class Average Score</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#34d399' }}>{stats.avg_score}%</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>High Risk Students</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f87171' }}>{stats.high_risk_count}</p>
        </div>
      </div>

      {/* Excel Upload Card */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Upload Student Marksheet Dataset (Excel / CSV)</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '15px' }}>
          Supported formats: <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code>. 
          Required columns: <code>student_id</code>, <code>score</code>.
        </p>

        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          disabled={loading}
          style={{ color: '#fff', backgroundColor: '#334155', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
        />

        {loading && <span style={{ marginLeft: '15px', color: '#818cf8' }}>Processing ML models...</span>}

        {statusMsg.text && (
          <p style={{ marginTop: '15px', color: statusMsg.type === 'success' ? '#34d399' : '#f87171' }}>
            {statusMsg.text}
          </p>
        )}
      </div>

      {/* Ingested Records Overview Table */}
      {stats.students.length > 0 && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px' }}>
          <h3>Processed Student Records</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Student ID</th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Score</th>
                <th style={{ padding: '10px' }}>Risk Status</th>
                <th style={{ padding: '10px' }}>Profile Cluster</th>
              </tr>
            </thead>
            <tbody>
              {stats.students.map((st) => (
                <tr key={st.student_id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px' }}>{st.student_id}</td>
                  <td style={{ padding: '10px' }}>{st.student_name}</td>
                  <td style={{ padding: '10px' }}>{st.total_obtained}%</td>
                  <td style={{ padding: '10px', color: st.ml_analytics?.risk_category === 'High Risk' ? '#f87171' : '#34d399' }}>
                    {st.ml_analytics?.risk_category}
                  </td>
                  <td style={{ padding: '10px', color: '#818cf8' }}>{st.ml_analytics?.cluster}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;