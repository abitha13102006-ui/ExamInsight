import React, { useEffect, useState } from 'react';

const StudentDashboard = () => {
  const [data, setData] = useState({
    name: "Alex Johnson",
    totalObtained: 45,
    maxMarks: 100,
    riskCategory: "High Risk",
    clusterLabel: "Cluster A",
    feedback: ["Foundational gap identified in Calculus", "Needs targeted practice in Integration"]
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1>Student Performance Workspace</h1>
      <p style={{ color: '#94a3b8' }}>Welcome, {data.name}</p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Exam Score</h3>
          <h2>{data.totalObtained} / {data.maxMarks}</h2>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Risk Category</h3>
          <h2 style={{ color: '#f59e0b' }}>{data.riskCategory}</h2>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Cluster Group</h3>
          <h2 style={{ color: '#818cf8' }}>{data.clusterLabel}</h2>
        </div>
      </div>

      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>AI Diagnostic Feedback</h3>
        {data.feedback.map((item, index) => (
          <p key={index} style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', color: '#fbbf24' }}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;