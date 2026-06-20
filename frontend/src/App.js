import React from 'react';
import { Dashboard } from './components/Dashboard';
import './styles/main.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>ZeroOracle</h1>
        <p className="tagline">AI-powered prediction market analysis, verifiable on 0G</p>
      </header>
      <main>
        <Dashboard />
      </main>
      <footer className="app-footer">
        <p>Powered by 0G Chain, 0G Storage, and 0G Compute Router</p>
      </footer>
    </div>
  );
}

export default App;
