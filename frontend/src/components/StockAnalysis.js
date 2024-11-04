import React, { useState } from 'react';
import { analyzeStock } from '../services/api';
import './StockAnalysis.css';

function StockAnalysis() {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeStock(symbol);
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to analyze stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value, key = '') => {
    if (typeof value === 'number') {
      if (['Debt to Equity', 'Return on Equity', 'Revenue Growth', 'Dividend Yield'].includes(key)) {
        return `${(value * 100).toFixed(2)}%`;
      }
      if (value > 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
      }
      return value.toFixed(2);
    }
    return 'N/A';
  };

  return (
    <div className="stock-analysis">
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
      <main className="container">
        <div className="input-section">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol"
            disabled={loading}
          />
          <button 
            onClick={handleAnalyze} 
            disabled={loading || !symbol.trim()}
            style={{ cursor: loading || !symbol.trim() ? 'not-allowed' : 'pointer' }}
          >
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
            <div className="company-header">
              <h2>{analysis.companyName}</h2>
              <p>Current Price: ${formatNumber(analysis.currentPrice)}</p>
              <p>Sector: {analysis.sector}</p>
              <p>Industry: {analysis.industry}</p>
            </div>
            
            <div className="metrics-container" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginTop: '20px'
            }}>
              {Object.entries(analysis.statistics).map(([category, metrics]) => (
                <div key={category} className="metrics-section">
                  <h3>{category}</h3>
                  <ul>
                    {Object.entries(metrics).map(([key, value]) => (
                      <li key={key}>
                        {key}: {formatNumber(value, key)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="gpt-analysis">
              <h3>AI Analysis:</h3>
              <p>{analysis.gptAnalysis}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StockAnalysis;
