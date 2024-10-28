import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Login from './components/Login';
import StockAnalysis from './components/StockAnalysis'; // We'll create this next
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Portfolio from './components/Portfolio';

function App() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Router>
      <div className="app">
        {user ? (
          <>
            <nav className="nav-bar">
              <div className="container">
                <div className="nav-content">
                  <Link to="/">Stock Analysis</Link>
                  <Link to="/portfolio">Portfolio</Link>
                  <div className="user-info">
                    <span>Welcome, {user.displayName}!</span>
                    <button onClick={() => auth.signOut()} className="sign-out-btn">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </nav>
            <Routes>
              <Route path="/" element={<StockAnalysis user={user} />} />
              <Route path="/portfolio" element={<Portfolio user={user} />} />
            </Routes>
          </>
        ) : (
          // ... keep your existing sign-in component ...
          <Login />
        )}
      </div>
    </Router>
  );
}

export default App;
