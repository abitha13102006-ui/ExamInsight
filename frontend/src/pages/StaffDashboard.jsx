import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Helper function to safely extract primitive numbers or text from MongoDB objects
const renderValue = (val) => {
  if (val === null || val === undefined) return '0';
  if (typeof val === 'object') {
    if (val.$numberDouble !== undefined) return val.$numberDouble;
    if (val.$numberInt !== undefined) return val.$numberInt;
    if (val.$numberLong !== undefined) return val.$numberLong;
    return JSON.stringify(val);
  }
  return String(val);
};

function StaffDashboard() {
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState({ total_students: 0, avg_score: 0, high_risk_count: 0, students: [] });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/exam/analytics/staff/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/exam/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setMessage(res.data.message);
        fetchDashboardData(); // Refresh UI metrics immediately
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'File upload failed. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#818cf8', marginBottom: '25px', textAlign: 'center', fontSize: '32px' }}>
        Faculty Analytics Dashboard
      </h1>

      {/* Analytics Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '25px', borderRadius: '10px', width: '250px', textAlign: 'center' }}>
          <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>Total Students</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{renderValue(stats.total_students)}</p>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '25px', borderRadius: '10px', width: '250px', textAlign: 'center' }}>
          <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>Class Average Score</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#34d399' }}>
            {renderValue(stats.avg_score)}%
          </p>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '25px', borderRadius: '10px', width: '250px', textAlign: 'center' }}>
          <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>High Risk Students</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#f87171' }}>
            {renderValue(stats.high_risk_count)}
          </p>
        </div>
      </div>

      {/* File Upload Box */}
      <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '10px', maxWidth: '600px', margin: '0 auto 40px auto', textAlign: 'center' }}>
        <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Upload Student Marksheet Dataset (Excel / CSV)</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
          Supported formats: <code>.xlsx</code>, <code>.csv</code> | Required columns: <code>student_id</code>, <code>score</code>
        </p>

        <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ color: '#94a3b8' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '10px 24px', 
              backgroundColor: '#6366f1', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '15px'
            }}
          >
            {loading ? 'Processing ML models...' : 'Upload & Run Analytics'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: '15px', color: message.includes('Successfully') ? '#34d399' : '#f87171', fontWeight: '500' }}>
            {message}
          </p>
        )}
      </div>

      {/* Student Dataset Table */}
      {stats.students && stats.students.length > 0 && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Processed Student Risk Records</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', color: '#f8fafc' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Student ID</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Score</th>
                <th style={{ padding: '12px' }}>Attendance</th>
                <th style={{ padding: '12px' }}>Risk Status</th>
                <th style={{ padding: '12px' }}>Learning Group</th>
              </tr>
            </thead>
            <tbody>
              {stats.students.map((st, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px' }}>{renderValue(st.student_id)}</td>
                  <td style={{ padding: '12px' }}>{renderValue(st.student_name)}</td>
                  <td style={{ padding: '12px' }}>{renderValue(st.total_obtained)}%</td>
                  <td style={{ padding: '12px' }}>{renderValue(st.attendance)}%</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: st.ml_analytics?.risk_category === 'High Risk' ? '#f87171' : '#34d399' }}>
                    {renderValue(st.ml_analytics?.risk_category)}
                  </td>
                  <td style={{ padding: '12px' }}>{renderValue(st.ml_analytics?.cluster)}</td>
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