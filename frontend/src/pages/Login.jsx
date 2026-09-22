import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [role, setRole] = useState('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/exam/login', {
        role,
        username,
        password
      });

      if (response.data.success) {
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>ExamInsight AI Login</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label><strong>Role:</strong></label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="staff">Faculty / Staff</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><strong>{role === 'staff' ? 'Username:' : 'Student ID:'}</strong></label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder={role === 'staff' ? 'e.g. admin' : 'e.g. 101'}
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label><strong>Password:</strong></label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter password"
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Demo Credentials:</strong></p>
        <p>• Staff: Username: <code>admin</code> | Password: <code>admin123</code></p>
        <p>• Student: Student ID: <code>101</code> | Password: <code>student123</code></p>
      </div>
    </div>
  );
};

export default Login;