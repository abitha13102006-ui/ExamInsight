import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [examName, setExamName] = useState('');
  const [stats, setStats] = useState({ total_students: 0, avg_score: 0, high_risk_count: 0, students: [] });
  const [history, setHistory] = useState([]);
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

  const fetchHistory = async () => {
    try {
      const res = await api.get('/exam/analytics/staff/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching class history:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchHistory();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (examName.trim()) {
      formData.append('exam_name', examName.trim());
    }

    setLoading(true);
    setMessage('');

    try {
      // NOTE: this must match the backend blueprint route exactly.
      // The backend registers POST /api/exam/upload-dataset (see exam_routes.py) —
      // a mismatched path here (e.g. '/exam/upload-csv') is what previously
      // caused every upload to fail with a generic network/404 error.
      const res = await api.post('/exam/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setMessage(res.data.message);
        setExamName('');
        fetchDashboardData(); // Refresh UI metrics immediately
        fetchHistory();       // Refresh historical trend with the new exam point
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
            type="text"
            placeholder="Exam label (e.g. Unit Test 1) — optional"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #334155',
              backgroundColor: '#0f172a',
              color: '#fff',
              width: '280px',
              fontSize: '14px'
            }}
          />
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

      {/* Historical Mark Analysis (class-wide, across every exam uploaded so far) */}
      {history.length > 0 && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
          <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Historical Mark Analysis (Class-Wide)</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '-8px', marginBottom: '15px' }}>
            Average score, average attendance, and high-risk count across every exam uploaded so far.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="exam_name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="avg_score" name="Avg Score %" stroke="#34d399" strokeWidth={2} />
              <Line type="monotone" dataKey="avg_attendance" name="Avg Attendance %" stroke="#818cf8" strokeWidth={2} />
              <Line type="monotone" dataKey="high_risk_count" name="High Risk Count" stroke="#f87171" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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