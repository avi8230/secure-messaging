import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import Chat from './components/Chat';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div>
      {isAuthenticated
        ? <Chat onLogout={() => setIsAuthenticated(false)} />
        : <AuthForm onLogin={() => setIsAuthenticated(true)} />}
    </div>
  );
}

export default App;
