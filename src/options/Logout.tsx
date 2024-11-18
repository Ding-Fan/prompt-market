// src/options/Logout.tsx

import React, { useContext } from 'react';
import { AuthContext } from '../shared/AuthContext';

const Logout: React.FC = () => {
  const { setToken } = useContext(AuthContext);

  const handleLogout = async () => {
    await chrome.storage.local.remove('authToken');
    setToken(null);
    alert('Logged out successfully.');
  };

  return (
    <button onClick={handleLogout} style={{ padding: '10px 20px', marginTop: '20px' }}>
      Logout
    </button>
  );
};

export default Logout;
