import React, { useState, useEffect } from 'react';
import './CreditCycle.css';
import { auth } from '../firebase';

function CreditCycle() {
  const [selectedStage, setSelectedStage] = useState('');
  const [interestRateData, setInterestRateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchInterestRateData();
      await loadPortfolio();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (interestRateData && portfolio.length > 0) {
      const currentStage = analyzeCreditCycle(interestRateData).stage;
      analyzePortfolio(portfolio, currentStage);
    }
  }, [interestRateData, portfolio]);

  const fetchInterestRateData = async () => {
    setLoading(true);
    try {
      // You'll need to replace this with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/interest-rates');
      const data = await response.json();
      setInterestRateData(data);
    } catch (error) {
      setError('Failed to fetch interest rate data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      const data = await response.json();
      setPortfolio(data.portfolio || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const analyzePortfolio = (holdings, currentStage) => {
    // Create a sector mapping object
    const sectorMapping = {
      'ENERGY & TRANSPORTATION': ['ENERGY', 'UTILITIES'],  // Map to both sectors
      'UTILITIES': ['UTILITIES'],
      'TECHNOLOGY': ['TECHNOLOGY'],
      'CONSUMER DISCRETIONARY': ['CONSUMER DISCRETIONARY'],
      'FINANCIALS': ['FINANCIALS'],
      'INDUSTRIALS': ['INDUSTRIALS'],
      'ENERGY': ['ENERGY'],
      'MATERIALS': ['MATERIALS'],
      'CONSUMER STAPLES': ['CONSUMER STAPLES'],
      'HEALTHCARE': ['HEALTHCARE'],
      'REAL ESTATE': ['REAL ESTATE']
    };

    const recommendedSectors = cycleStages[currentStage].sectors.map(s => s.name.toUpperCase());
    
    const analysis = {
      alignedHoldings: [],
      nonAlignedHoldings: [],
      recommendations: []
    };

    // Calculate total portfolio value
    const totalValue = holdings.reduce((sum, holding) => 
      sum + (Number(holding.shares) * Number(holding.purchasePrice)), 0);

    // Analyze each holding
    holdings.forEach(holding => {
      const stockSector = holding.sector ? holding.sector.toUpperCase() : 'UNKNOWN';
      const mappedSectors = sectorMapping[stockSector] || [stockSector];
      const holdingValue = Number(holding.shares) * Number(holding.purchasePrice);
      const percentOfPortfolio = ((holdingValue / totalValue) * 100).toFixed(1);
      
      // Check if any of the mapped sectors are recommended
      if (mappedSectors.some(sector => recommendedSectors.includes(sector))) {
        analysis.alignedHoldings.push({
          symbol: holding.symbol,
          sector: holding.sector || 'Unknown',
          value: holdingValue,
          percentOfPortfolio,
          reason: `Well positioned for ${cycleStages[currentStage].name} phase`
        });
      } else {
        analysis.nonAlignedHoldings.push({
          symbol: holding.symbol,
          sector: holding.sector || 'Unknown',
          value: holdingValue,
          percentOfPortfolio,
          suggestion: `Consider reducing exposure as ${holding.sector || 'this sector'} may underperform in ${cycleStages[currentStage].name} phase`
        });
      }
    });

    // Group holdings by sector with null check and sector mapping
    const sectorExposure = holdings.reduce((acc, holding) => {
      const sector = holding.sector ? holding.sector.toUpperCase() : 'UNKNOWN';
      const holdingValue = Number(holding.shares) * Number(holding.purchasePrice);
      const percentOfPortfolio = (holdingValue / totalValue) * 100;

      // Special handling for Energy & Transportation sector
      if (sector === 'ENERGY & TRANSPORTATION') {
        // Add to both ENERGY and UTILITIES sectors
        if (!acc['ENERGY']) acc['ENERGY'] = 0;
        if (!acc['UTILITIES']) acc['UTILITIES'] = 0;
        acc['ENERGY'] += percentOfPortfolio;
        acc['UTILITIES'] += percentOfPortfolio;
      } else {
        const mappedSectors = sectorMapping[sector] || [sector];
        mappedSectors.forEach(mappedSector => {
          if (!acc[mappedSector]) acc[mappedSector] = 0;
          acc[mappedSector] += percentOfPortfolio;
        });
      }
      return acc;
    }, {});

    // Add recommendations for missing or underweight recommended sectors
    recommendedSectors.forEach(sector => {
      const currentExposure = sectorExposure[sector] || 0;
      // Always show utilities in recommendations if it's recommended for the current stage
      if (currentExposure === 0 || (sector === 'UTILITIES' && cycleStages[currentStage].sectors.some(s => s.name.toUpperCase() === 'UTILITIES'))) {
        analysis.recommendations.push({
          sector: sector,
          currentExposure: `${currentExposure.toFixed(2)}%`,
          reason: cycleStages[currentStage].sectors.find(s => s.name.toUpperCase() === sector).reason
        });
      }
    });

    setPortfolioAnalysis(analysis);
  };

  const analyzeCreditCycle = (rates) => {
    if (!rates) return null;

    const { fedFundsRate, tenYearYield, twoYearYield, defaultRate } = rates;
    
    // Add default rate logic to cycle determination
    if (fedFundsRate > 5 || defaultRate > 3) {
      return {
        stage: 'contraction',
        reason: `High Fed Funds rate (${fedFundsRate}%) and elevated default rates (${defaultRate}%) indicate tight monetary policy and credit stress, typical of contraction phase`
      };
    } else if (tenYearYield < twoYearYield && defaultRate >= 1.5 && defaultRate <= 3) {
      return {
        stage: 'peak',
        reason: `Inverted yield curve and rising default rates (${defaultRate}%) signal peak of credit cycle`
      };
    } else if (fedFundsRate < 2 && defaultRate < 1.5) {
      return {
        stage: 'expansion',
        reason: `Low rates and healthy default rates (${defaultRate}%) indicate accommodative policy and strong credit conditions, typical of expansion phase`
      };
    } else if (defaultRate > 5) {
      return {
        stage: 'trough',
        reason: `High default rates (${defaultRate}%) indicate significant credit stress, typical of cycle trough`
      };
    } else {
      // Default case with more nuanced analysis
      const stageAnalysis = [];
      if (fedFundsRate > 3) stageAnalysis.push("elevated interest rates");
      if (defaultRate > 2) stageAnalysis.push("deteriorating credit conditions");
      if (tenYearYield < twoYearYield) stageAnalysis.push("inverted yield curve");
      
      return {
        stage: 'contraction',
        reason: `Mixed signals with ${stageAnalysis.join(", ")} suggest transitioning through contraction phase`
      };
    }
  };

  const cycleStages = {
    expansion: {
      name: 'Expansion (Easing)',
      characteristics: [
        'Easy access to credit',
        'Low interest rates',
        'Growing corporate debt',
        'Default Rates: Low (0.5-1.5%)'
      ],
      sectors: [
        { name: 'Technology', reason: 'Increased innovation and spending' },
        { name: 'Consumer Discretionary', reason: 'High consumer confidence drives spending' },
        { name: 'Financials', reason: 'Banks benefit from increased lending' }
      ]
    },
    peak: {
      name: 'Peak (Excess)',
      characteristics: [
        'High asset valuations',
        'Increased borrowing',
        'Potential speculative bubbles',
        'Default Rates: Rising (1.5-3%)'
      ],
      sectors: [
        { name: 'Industrials', reason: 'High capital expenditures during peak growth' },
        { name: 'Energy', reason: 'Strong demand for energy resources' },
        { name: 'Materials', reason: 'High demand for raw materials' }
      ]
    },
    contraction: {
      name: 'Contraction (Tightening)',
      characteristics: [
        'Rising interest rates',
        'Restricted credit',
        'Falling asset prices',
        'Default Rates: High (3-5%)'
      ],
      sectors: [
        { name: 'Consumer Staples', reason: 'Essential goods remain in demand' },
        { name: 'Healthcare', reason: 'Consistent demand regardless of conditions' },
        { name: 'Utilities', reason: 'Stable returns from essential services' }
      ]
    },
    trough: {
      name: 'Trough (Deleveraging)',
      characteristics: [
        'Widespread defaults',
        'Low credit availability',
        'Economic slowdown',
        'Default Rates: Peak (>5%)'
      ],
      sectors: [
        { name: 'Real Estate', reason: 'Recovery as interest rates fall' },
        { name: 'Financials', reason: 'Benefits from early recovery' },
        { name: 'Industrials', reason: 'Driven by economic recovery' }
      ]
    }
  };

  return (
    <div className="credit-cycle">
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

      <div className="current-analysis">
        <h2>Current Credit Cycle Analysis</h2>
        {loading && <p>Loading interest rate data...</p>}
        {error && <p className="error">{error}</p>}
        {interestRateData && (
          <div className="rate-analysis">
            <div className="current-rates">
              <h3>Current Interest Rates</h3>
              <ul>
                <li>Fed Funds Rate: {interestRateData.fedFundsRate}%</li>
                <li>10-Year Treasury: {interestRateData.tenYearYield}%</li>
                <li>2-Year Treasury: {interestRateData.twoYearYield}%</li>
                <li>Yield Spread: {(interestRateData.tenYearYield - interestRateData.twoYearYield).toFixed(2)}%</li>
              </ul>
            </div>
            
            <div className="cycle-indication">
              <h3>Cycle Indication</h3>
              {analyzeCreditCycle(interestRateData) && (
                <>
                  <p className="indicated-stage">
                    Current indicators suggest we are in the{' '}
                    <strong>{cycleStages[analyzeCreditCycle(interestRateData).stage].name}</strong> stage
                  </p>
                  <p className="indication-reason">
                    {analyzeCreditCycle(interestRateData).reason}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {portfolio.length > 0 && portfolioAnalysis && (
        <div className="portfolio-analysis">
          <h2>Portfolio Analysis for {cycleStages[analyzeCreditCycle(interestRateData).stage].name} Phase</h2>
          <div className="analysis-grid">
            <div className="analysis-section">
              <h3>Well-Positioned Holdings ({portfolioAnalysis.alignedHoldings.length})</h3>
              {portfolioAnalysis.alignedHoldings.length > 0 ? (
                <ul>
                  {portfolioAnalysis.alignedHoldings.map((holding, index) => (
                    <li key={index}>
                      <strong>{holding.symbol}</strong> ({holding.sector})
                      <div className="holding-details">
                        <span>{holding.percentOfPortfolio}% of portfolio</span>
                        <p>{holding.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No holdings currently aligned with cycle recommendations</p>
              )}
            </div>

            <div className="analysis-section">
              <h3>Holdings to Review ({portfolioAnalysis.nonAlignedHoldings.length})</h3>
              {portfolioAnalysis.nonAlignedHoldings.length > 0 ? (
                <ul>
                  {portfolioAnalysis.nonAlignedHoldings.map((holding, index) => (
                    <li key={index}>
                      <strong>{holding.symbol}</strong> ({holding.sector})
                      <div className="holding-details">
                        <span>{holding.percentOfPortfolio}% of portfolio</span>
                        <p>{holding.suggestion}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>All holdings aligned with cycle recommendations</p>
              )}
            </div>

            <div className="analysis-section">
              <h3>Recommended Sector Additions</h3>
              <ul>
                {portfolioAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>
                    <strong>{rec.sector}</strong>
                    <div className="holding-details">
                      <span>Current exposure: {rec.currentExposure}</span>
                      <p>{rec.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="cycle-selector">
        <h2>Select Credit Cycle Stage</h2>
        <div className="stage-buttons">
          {Object.entries(cycleStages).map(([stage, data]) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={selectedStage === stage ? 'active' : ''}
            >
              {data.name}
            </button>
          ))}
        </div>
      </div>

      {selectedStage && (
        <div className="stage-info">
          <div className="characteristics">
            <h4>Characteristics</h4>
            <ul>
              {cycleStages[selectedStage].characteristics.map((char, index) => (
                <li key={index}>{char}</li>
              ))}
            </ul>
          </div>

          <div className="recommended-sectors">
            <h4>Recommended Sectors</h4>
            <div className="sectors-grid">
              {cycleStages[selectedStage].sectors.map((sector, index) => (
                <div key={index} className="sector-card">
                  <h5>{sector.name}</h5>
                  <p>{sector.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditCycle; 