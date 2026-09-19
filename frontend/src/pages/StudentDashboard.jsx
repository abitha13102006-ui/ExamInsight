import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StudentDashboard = () => {
  const studentDatabase = {
    "STU101": {
      name: "Alex Johnson",
      totalObtained: 45,
      maxMarks: 100,
      riskCategory: "High Risk",
      clusterLabel: "Cluster A: Focus Needed",
      feedback: ["Foundational gap identified in Calculus", "Needs targeted practice in Integration"],
      history: [
        { exam_name: "Mid Term 1", marks_obtained: 38, max_marks: 100 },
        { exam_name: "Mid Term 2", marks_obtained: 42, max_marks: 100 },
        { exam_name: "Final Exam", marks_obtained: 45, max_marks: 100 }
      ]
    },
    "STU102": {
      name: "Priya Sharma",
      totalObtained: 88,
      maxMarks: 100,
      riskCategory: "Low Risk",
      clusterLabel: "Cluster C: Advanced",
      feedback: ["Excellent grasp on core concepts.", "Ready for advanced coursework."],
      history: [
        { exam_name: "Mid Term 1", marks_obtained: 78, max_marks: 100 },
        { exam_name: "Mid Term 2", marks_obtained: 84, max_marks: 100 },
        { exam_name: "Final Exam", marks_obtained: 88, max_marks: 100 }
      ]
    }
  };

  const [selectedId, setSelectedId] = useState("STU101");
  const data = studentDatabase[selectedId];

  // Self-contained light-mode card styling (No App.css needed)
  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    padding: '24px'
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Student Record Switcher */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontWeight: 600, color: '#1e293b' }}>Select Student Record:</label>
        <select 
          value={selectedId} 
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="STU101">STU101 - Alex Johnson (High Risk)</option>
          <option value="STU102">STU102 - Priya Sharma (Low Risk)</option>
        </select>
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Student Performance Workspace</h1>
      <p style={{ color: '#64748b', marginTop: '4px', marginBottom: '24px' }}>Welcome, {data.name}</p>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Latest Exam Score</p>
          <p style={{ color: '#1e293b', fontSize: '2rem', fontWeight: 700, margin: '8px 0 0 0' }}>{data.totalObtained} / {data.maxMarks}</p>
        </div>

        <div style={cardStyle}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Risk Category</p>
          <div style={{ marginTop: '12px' }}>
            <span style={{ 
              backgroundColor: data.riskCategory === "High Risk" ? '#fef2f2' : '#f0fdf4', 
              color: data.riskCategory === "High Risk" ? '#dc2626' : '#16a34a', 
              border: `1px solid ${data.riskCategory === "High Risk" ? '#fecaca' : '#bbf7d0'}`, 
              padding: '6px 14px', 
              borderRadius: '9999px', 
              fontWeight: 600 
            }}>
              {data.riskCategory}
            </span>
          </div>
        </div>

        <div style={cardStyle}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Cluster Group</p>
          <p style={{ color: '#2563eb', fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 0 0' }}>{data.clusterLabel}</p>
        </div>
      </div>

      {/* Academic Marks History Chart */}
      <div style={{ ...cardStyle, height: '320px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1e293b', marginTop: 0 }}>Academic Marks History</h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={data.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="exam_name" stroke="#64748b" />
            <YAxis domain={[0, 100]} stroke="#64748b" />
            <Tooltip />
            <Line type="monotone" dataKey="marks_obtained" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Diagnostic Feedback */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '16px', color: '#1e293b', marginTop: 0 }}>AI Diagnostic Feedback</h3>
        {data.feedback.map((item, index) => (
          <p 
            key={index} 
            style={{ 
              padding: '12px 16px', 
              backgroundColor: '#fef2f2', 
              borderLeft: '4px solid #dc2626', 
              color: '#991b1b', 
              borderRadius: '0 8px 8px 0', 
              marginBottom: '10px',
              fontWeight: 500 
            }}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;