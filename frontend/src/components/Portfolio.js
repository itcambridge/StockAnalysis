import React, { useState, useEffect } from 'react';

function Portfolio() {
  const [stocks, setStocks] = useState(() => {
    // Initialize stocks from localStorage if available
    const savedStocks = localStorage.getItem('portfolio');
    return savedStocks ? JSON.parse(savedStocks) : [];
  });
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  // Save to localStorage whenever stocks change
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(stocks));
  }, [stocks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newStock = {
      symbol: symbol.toUpperCase(),
      shares: parseFloat(shares),
      purchasePrice: parseFloat(purchasePrice),
      date: new Date().toISOString()
    };

    setStocks([...stocks, newStock]);
    setSymbol('');
    setShares('');
    setPurchasePrice('');
  };

  const removeStock = (index) => {
    const updatedStocks = stocks.filter((_, i) => i !== index);
    setStocks(updatedStocks);
  };

  return (
    <div className="portfolio">
      <h2>My Portfolio</h2>
      
      <form onSubmit={handleSubmit} className="add-stock-form">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol"
          required
        />
        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="Number of Shares"
          required
        />
        <input
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          placeholder="Purchase Price"
          required
        />
        <button type="submit">Add Stock</button>
      </form>

      <div className="portfolio-list">
        <h3>Your Holdings</h3>
        {stocks.length === 0 ? (
          <p>No stocks in portfolio yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Purchase Price</th>
                <th>Total Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.symbol}</td>
                  <td>{stock.shares}</td>
                  <td>${stock.purchasePrice.toFixed(2)}</td>
                  <td>${(stock.shares * stock.purchasePrice).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeStock(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Portfolio;
