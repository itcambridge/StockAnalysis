import React, { useState, useEffect } from 'react';
import StockAnalysis from './components/StockAnalysis';
import Portfolio from './components/Portfolio';
import CreditCycle from './components/CreditCycle';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('analysis');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="App" style={{ backgroundColor: 'black', minHeight: '100vh', color: 'white' }}>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          padding: '20px'
        }}>
          <p style={{ 
            color: '#ddd',
            marginBottom: '2rem' 
          }}>Please sign in to access the application</p>
        </div>
        <div className="banner-container" style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px 0'
        }}>
          <img 
            src="/backdrop/banner.png"
            alt="Stock Analysis Banner"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          padding: '20px'
        }}>
          <button 
            onClick={handleSignIn}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#9eda9b',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ backgroundColor: 'black', minHeight: '100vh', color: 'white' }}>
      <nav style={{
        padding: '1rem',
        backgroundColor: '#1a1a1a',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setCurrentView('analysis')}
            style={{
              backgroundColor: currentView === 'analysis' ? '#9eda9b' : '#2d2d2d',
              color: currentView === 'analysis' ? 'black' : 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Stock Analysis
          </button>
          <button 
            onClick={() => setCurrentView('portfolio')}
            style={{
              backgroundColor: currentView === 'portfolio' ? '#9eda9b' : '#2d2d2d',
              color: currentView === 'portfolio' ? 'black' : 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            My Portfolio
          </button>
          <button 
            onClick={() => setCurrentView('creditcycle')}
            style={{
              backgroundColor: currentView === 'creditcycle' ? '#9eda9b' : '#2d2d2d',
              color: currentView === 'creditcycle' ? 'black' : 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Credit Cycle
          </button>
        </div>
        <button 
          onClick={() => auth.signOut()}
          style={{
            backgroundColor: '#e64152',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Sign Out
        </button>
      </nav>
      {currentView === 'analysis' ? (
        <StockAnalysis />
      ) : currentView === 'portfolio' ? (
        <Portfolio />
      ) : (
        <CreditCycle />
      )}
    </div>
  );
}

export default App;
