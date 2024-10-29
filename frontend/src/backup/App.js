import React from 'react';
import StockAnalysis from './components/StockAnalysis';
import './App.css';

function App() {
  // Update mock user data to match expected props
  const user = {
    displayName: 'Mark Austin',
    email: 'mark@example.com'
  };

  return (
    <div className="App">
      <StockAnalysis user={user} />
    </div>
  );
}

export default App;
