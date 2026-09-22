import React, { useState } from 'react';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [userAuth, setUserAuth] = useState(null);

  const handleLoginSuccess = (authData) => {
    setUserAuth(authData);
  };

  const handleLogout = () => {
    setUserAuth(null);
  };

  if (!userAuth) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>ExamInsight AI Dashboard</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Logged in as: <strong>{userAuth.role.toUpperCase()}</strong></span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      {userAuth.role === 'staff' ? (
        <StaffDashboard />
      ) : (
        <StudentDashboard studentId={userAuth.student_id} initialData={userAuth.data} />
      )}
    </div>
  );
}

export default App;