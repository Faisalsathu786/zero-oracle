import React from 'react';

const DIRECTION_COLORS = {
  YES: '#00a88b',
  NO: '#f85149'
};

const CONFIDENCE_LABELS = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence'
};

const CONFIDENCE_CLASSES = {
  high: 'confidence-high',
  medium: 'confidence-medium',
  low: 'confidence-low'
};

function PredictionCard({ data }) {
  const { marketQuestion, currentPrice, analysis } = data;

  if (!analysis) {
    return (
      <div className="prediction-card card-error">
        <div className="card-header">
          <h3>{marketQuestion || 'Unknown Market'}</h3>
        </div>
        <p className="error-text">Analysis failed for this market</p>
      </div>
    );
  }

  const { probability, direction, confidence, keyFactors, reasoningSummary } = analysis;
  const priceDiff = currentPrice !== null
    ? (probability - currentPrice).toFixed(1)
    : null;

  return (
    <div className="prediction-card">
      <div className="card-header">
        <h3>{marketQuestion}</h3>
        <span
          className={`direction-badge ${direction === 'YES' ? 'direction-yes' : 'direction-no'}`}
          style={{ backgroundColor: DIRECTION_COLORS[direction] }}
        >
          {direction}
        </span>
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">AI Probability</span>
          <span className="stat-value">{probability}%</span>
        </div>
        {currentPrice !== null && (
          <div className="stat">
            <span className="stat-label">Market Price</span>
            <span className="stat-value">{currentPrice.toFixed(1)}%</span>
          </div>
        )}
        {priceDiff !== null && (
          <div className="stat">
            <span className="stat-label">Spread</span>
            <span className={`stat-value ${Math.abs(priceDiff) > 10 ? 'spread-high' : 'spread-low'}`}>
              {priceDiff > 0 ? '+' : ''}{priceDiff}%
            </span>
          </div>
        )}
        <div className="stat">
          <span className="stat-label">Confidence</span>
          <span className={`stat-value ${CONFIDENCE_CLASSES[confidence] || ''}`}>
            {CONFIDENCE_LABELS[confidence] || confidence}
          </span>
        </div>
      </div>

      {reasoningSummary && (
        <div className="card-section">
          <h4>Analysis</h4>
          <p className="reasoning-text">{reasoningSummary}</p>
        </div>
      )}

      {keyFactors && keyFactors.length > 0 && (
        <div className="card-section">
          <h4>Key Factors</h4>
          <ul className="factors-list">
            {keyFactors.map((factor, i) => (
              <li key={i}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-footer">
        <span className="timestamp">
          {new Date(analysis.timestamp || Date.now()).toLocaleString()}
        </span>
        <span className="model-badge">{analysis.model || 'AI'}</span>
      </div>
    </div>
  );
}

export { PredictionCard };
