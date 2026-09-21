import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

function StudentDashboard() {
  const [studentId, setStudentId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudentData = async () => {
    if (!studentId.trim()) {
      setError('Please enter a valid Student ID.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.get(`/exam/analytics/student/${studentId.trim()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError('Student record not found. Please verify the Student ID.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#818cf8', marginBottom: '10px' }}>Student Performance & Diagnosis Portal</h1>
      <p style={{ color: '#94a3b8', marginBottom: '25px' }}>
        Enter your Student ID to access your ML-driven risk evaluation, topic mastery breakdown, and target recommendations.
      </p>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Enter Student ID (e.g. 101, 102)" 
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchStudentData()}
          style={{ 
            padding: '12px 16px', 
            borderRadius: '6px', 
            border: '1px solid #334155', 
            backgroundColor: '#1e293b', 
            color: '#fff',
            minWidth: '280px',
            fontSize: '15px'
          }}
        />
        <button 
          onClick={fetchStudentData}
          disabled={loading}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#6366f1', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px'
          }}
        >
          {loading ? 'Searching...' : 'View My Performance'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#450a0a', border: '1px solid #991b1b', color: '#f87171', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Student Analytics Results */}
      {data && (
        <div>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: '4px solid #818cf8' }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>{data.student_name}</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>Student ID: {data.student_id} | Attendance: {data.attendance}%</p>
          </div>

          {/* Top Metric Cards */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>Overall Score</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#34d399' }}>{data.total_obtained}%</p>
            </div>
            
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>Risk Category</h4>
              <p style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                margin: 0, 
                color: data.ml_analytics?.risk_category === 'High Risk' ? '#f87171' : data.ml_analytics?.risk_category === 'Medium Risk' ? '#fbbf24' : '#34d399' 
              }}>
                {data.ml_analytics?.risk_category || 'N/A'}
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>Learning Speed Profile</h4>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#818cf8' }}>
                {data.ml_analytics?.cluster || 'N/A'}
              </p>
            </div>
          </div>

          {/* Topic-Wise Breakdown */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Topic-Wise Mastery & Weak Point Analysis</h3>
            {data.topic_scores && Object.keys(data.topic_scores).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                {Object.entries(data.topic_scores).map(([topic, score]) => (
                  <div key={topic} style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '6px', border: score < 50 ? '1px solid #f87171' : '1px solid #334155' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8', display: 'block' }}>{topic}</span>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: score < 50 ? '#f87171' : '#f8fafc' }}>{score}%</span>
                    {score < 50 && <span style={{ fontSize: '11px', color: '#f87171', display: 'block', marginTop: '4px' }}>Needs Attention</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>No detailed topic scores recorded.</p>
            )}
          </div>

          {/* Personalized Recommendations */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ color: '#fbbf24', marginTop: 0 }}>AI Diagnosis & Recommended Actions</h3>
            {data.ml_analytics?.improvement_suggestions && data.ml_analytics.improvement_suggestions.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {data.ml_analytics.improvement_suggestions.map((suggestion, idx) => (
                  <li key={idx} style={{ color: '#e2e8f0', margin: '8px 0', fontSize: '15px' }}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#94a3b8', margin: 0 }}>No critical weaknesses identified. Keep up the good performance!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;