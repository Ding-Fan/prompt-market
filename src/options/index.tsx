import '../global.css';
import { createRoot } from 'react-dom/client';
import React, { useContext, useState } from 'react';
import Login from './Login';
import Register from './Register';
import ProtectedContent from './ProtectedContent'; // Ensure this component exists
import { AuthProvider, AuthContext } from '../shared/AuthContext';

const App: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);

  const toggleView = () => {
    setIsRegister(!isRegister);
  };

  return (
    <div>
      {token ? (
        <ProtectedContent />
      ) : (
        <div>
          {isRegister ? <Register /> : <Login />}
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggleView}
              style={{
                color: 'blue',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
