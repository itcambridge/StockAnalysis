import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { auth } from '../firebase';

function StockAnalysis({ user }) {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:5000/api/analyze/${symbol}`, {
        headers: {
          'Authorization': idToken
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError("Failed to fetch stock data or generate analysis. Please try again.");
      console.error(err);
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
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
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
