import React, { useState, useEffect } from 'react';
import { PredictionCard } from './PredictionCard';
import { HistoryLog } from './HistoryLog';

function Dashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('live');
  const [marketTag, setMarketTag] = useState('sports');

  const fetchLive = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: marketTag, limit: 6 })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPredictions(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-controls">
        <div className="tab-bar">
          <button
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Analysis
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>
      </div>

      {activeTab === 'live' && (
        <div className="live-section">
          <div className="controls-row">
            <select
              value={marketTag}
              onChange={(e) => setMarketTag(e.target.value)}
              className="tag-select"
            >
              <option value="sports">Sports</option>
              <option value="crypto">Crypto</option>
              <option value="politics">Politics</option>
              <option value="news">News</option>
            </select>
            <button
              onClick={fetchLive}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {error && (
            <div className="error-banner">
              Error: {error}
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Running AI analysis via 0G Compute Router...</p>
            </div>
          )}

          {!loading && predictions.length === 0 && !error && (
            <div className="empty-state">
              <p>Select a market category and run analysis to see AI-powered predictions.</p>
              <p className="hint">Each prediction is stored permanently on 0G Storage for verifiable audit trails.</p>
            </div>
          )}

          <div className="predictions-grid">
            {predictions.map((p, i) => (
              <PredictionCard key={i} data={p} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <HistoryLog />
      )}

      {activeTab === 'about' && (
        <div className="about-section">
          <h2>ZeroOracle - AI Prediction Oracle</h2>
          <p>ZeroOracle is a decentralized AI system that analyzes prediction markets using on-chain AI inference on 0G.</p>
          <h3>How it works</h3>
          <ol>
            <li>Agent fetches a prediction market from Polymarket</li>
            <li>AI model on 0G Compute Router analyzes news and market data</li>
            <li>Prediction with reasoning is stored on 0G Storage (permanent audit trail)</li>
            <li>Prediction hash is recorded on 0G Chain via OracleRegistry contract</li>
            <li>Users can verify predictions and compare with actual outcomes</li>
          </ol>
          <h3>Stack</h3>
          <ul>
            <li>0G Chain - EVM-compatible smart contracts for prediction registry</li>
            <li>0G Storage - Permanent, verifiable storage for analysis trails</li>
            <li>0G Compute Router - Decentralized AI inference (GLM-5)</li>
            <li>Polymarket - Prediction market data source</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export { Dashboard };
