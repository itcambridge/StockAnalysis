import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { auth } from '../firebase';
import './StockAnalysis.css';

function StockAnalysis({ user }) {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeStock = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const idToken = await user.getIdToken();
      
      const response = await fetch(`http://localhost:5000/api/analyze/${symbol}`, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (response.ok) {
        if (!data.statistics || typeof data.statistics !== 'object') {
          throw new Error('Invalid data format received from server');
        }
        setAnalysis(data);
      } else {
        setError(data.error || 'Failed to analyze stock');
        setAnalysis(null);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        console.error('Analysis error:', err);
        setError(err.message || 'Failed to connect to server');
      }
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return 'N/A';
  };

  return (
    <div className="stock-analysis">
      <header className="app-header">
        <div className="container">
          <div className="user-info">
            <span>Welcome, {user.displayName}!</span>
            <button onClick={() => auth.signOut()} className="sign-out-btn">Sign Out</button>
          </div>
        </div>
      </header>
      <main className="container">
        <div className="app-logo">
          <img src="/Valuee.png" alt="Value View AI Stock Analysis Logo" />
        </div>
        <h1>Stock Analysis App</h1>
        <div className="input-section">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol"
            disabled={loading}
          />
          <button onClick={analyzeStock} disabled={loading || !symbol}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {loading && (
          <div className="loading">
            <p>Analyzing stock data...</p>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {analysis && (
          <div className="analysis-results">
            <h2>{analysis.companyName}</h2>
            <p>Current Price: ${formatNumber(analysis.currentPrice)}</p>
            <p>Sector: {analysis.sector}</p>
            <p>Industry: {analysis.industry}</p>
            
            {Object.entries(analysis.statistics).map(([category, metrics]) => (
              <div key={category}>
                <h3>{category}</h3>
                <ul>
                  {Object.entries(metrics).map(([key, value]) => (
                    <li key={key}>
                      {key}: {formatNumber(value)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <h3>AI Analysis:</h3>
            <p>{analysis.gptAnalysis}</p>
          </div>
        )}
      </main>
    </div>
  );
}

StockAnalysis.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    getIdToken: PropTypes.func.isRequired
  }).isRequired
};

export default StockAnalysis;
