import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/staff/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const triggerML = async () => {
    setLoading(true);
    try {
      await api.post('/ml/exam/EXAM101/run-pipeline');
      await fetchStats();
      alert('ML Pipeline successfully executed!');
    } catch (err) {
      alert('Failed to execute ML pipeline');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Average Score', value: stats?.avg_score || 0 },
    { name: 'High Risk Count', value: stats?.high_risk_count || 0 }
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Faculty Analytics Workspace</h2>
          <p style={{ color: '#94a3b8' }}>Class Cohort & Predictive Machine Learning Panel</p>
        </div>
        <button 
          onClick={triggerML} 
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Executing ML Engine...' : 'Run ML Risk & Clustering'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8' }}>Total Students Assessed</p>
          <h3>{stats?.total_students || 0}</h3>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8' }}>Class Average Score</p>
          <h3>{stats?.avg_score || 0}%</h3>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8' }}>High Risk Students Identified</p>
          <h3 style={{ color: '#f43f5e' }}>{stats?.high_risk_count || 0}</h3>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', height: '300px' }}>
        <h3>Cohort Performance Distribution</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StaffDashboard;