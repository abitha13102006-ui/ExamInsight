import React, { useState } from 'react';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [view, setView] = useState('staff');

  return (
    <div>
      <nav style={{ padding: '12px 20px', backgroundColor: '#1e293b', display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setView('staff')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: view === 'staff' ? '#6366f1' : '#334155', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Faculty View
        </button>
        <button 
          onClick={() => setView('student')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: view === 'student' ? '#6366f1' : '#334155', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Student View
        </button>
      </nav>

      {view === 'staff' ? <StaffDashboard /> : <StudentDashboard />}
    </div>
  );
}

export default App;