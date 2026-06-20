import React, { useState } from 'react';

function App() {
  const [page, setPage] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPage('home');
  };

  const handleLogin = (t, u) => {
    localStorage.setItem('token', t);
    setToken(t);
    setUser(u);
    setPage('analyze');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand" onClick={() => setPage('home')}>
            <h1>ZeroOracle</h1>
            <span className="tagline">AI-Powered Prediction Markets</span>
          </div>
          <nav className="nav">
            {token ? (
              <>
                <button onClick={() => setPage('analyze')} className="nav-btn">Analyze</button>
                <button onClick={() => setPage('history')} className="nav-btn">History</button>
                <button onClick={handleLogout} className="nav-btn nav-logout">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => setPage('login')} className="nav-btn">Login</button>
                <button onClick={() => setPage('signup')} className="nav-btn nav-signup">Sign Up</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {page === 'home' && <HomePage onGetStarted={() => setPage(token ? 'analyze' : 'signup')} />}
        {page === 'login' && <LoginPage onLogin={handleLogin} onSwitch={() => setPage('signup')} />}
        {page === 'signup' && <SignupPage onSignup={handleLogin} onSwitch={() => setPage('login')} />}
        {page === 'analyze' && <AnalyzePage token={token} />}
        {page === 'history' && <HistoryPage token={token} />}
        {page === 'report' && <ReportPage token={token} />}
      </main>

      <footer className="app-footer">
        <p>Powered by 0G Chain, 0G Storage, and 0G Compute Router</p>
        <p className="footer-links">
          <a href="https://github.com/Faisalsathu786/zero-oracle" target="_blank">GitHub</a>
          <a href="https://chainscan.0g.ai/address/0xB2b449C90deFFe54C8c2ccfEd62A8a7F84B8108a" target="_blank">Contract</a>
          <a href="https://0g.ai/arena/zero-cup" target="_blank">Zero Cup</a>
        </p>
      </footer>
    </div>
  );
}

function HomePage({ onGetStarted }) {
  return (
    <div className="home-page">
      <section className="hero">
        <h2>Predict Markets with AI Precision</h2>
        <p className="hero-sub">
          Paste any Polymarket link and get AI-powered analysis. Our agent reads world data,
          analyzes news, and tells you which outcome has the edge.
        </p>
        <div className="hero-steps">
          <div className="step">
            <div className="step-num">1</div>
            <h4>Paste Link</h4>
            <p>Any Polymarket market URL</p>
          </div>
          <div className="step-arrow">--></div>
          <div className="step">
            <div className="step-num">2</div>
            <h4>AI Analyzes</h4>
            <p>0G Compute Router processes news + data</p>
          </div>
          <div className="step-arrow">--></div>
          <div className="step">
            <div className="step-num">3</div>
            <h4>Get Signal</h4>
            <p>Buy/Hold recommendation + reasoning</p>
          </div>
        </div>
        <button onClick={onGetStarted} className="btn-primary btn-large">Get Started</button>
      </section>

      <section className="features">
        <div className="feature-card">
          <h4>AI Analysis</h4>
          <p>Powered by 0G Compute Router - decentralized AI inference with TEE verification</p>
        </div>
        <div className="feature-card">
          <h4>Verifiable Records</h4>
          <p>Every prediction stored on 0G Storage and hashed on 0G Chain</p>
        </div>
        <div className="feature-card">
          <h4>Actionable Signals</h4>
          <p>Compare AI probability vs market price to spot mispricing</p>
        </div>
      </section>

      <section className="stats-bar">
        <div className="stat-item">
          <span className="stat-num">3</span>
          <span className="stat-label">0G Products Used</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">4</span>
          <span className="stat-label">Predictions On-Chain</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">2</span>
          <span className="stat-label">Files on 0G Storage</span>
        </div>
      </section>
    </div>
  );
}

function LoginPage({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.token, data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="btn-primary btn-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch">No account? <a href="#" onClick={onSwitch}>Sign up</a></p>
      </div>
    </div>
  );
}

function SignupPage({ onSignup, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSignup(data.token, data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="btn-primary btn-full">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <a href="#" onClick={onSwitch}>Login</a></p>
      </div>
    </div>
  );
}

function AnalyzePage({ token }) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.market || 'Analysis failed');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyze-page">
      <div className="input-section">
        <h2>Analyze a Market</h2>
        <p>Paste a Polymarket URL to get AI-powered analysis and a trading signal.</p>
        <div className="url-input-row">
          <input
            type="text"
            placeholder="https://polymarket.com/event/switzerland-world-cup-2026"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="url-input"
          />
          <button onClick={handleAnalyze} disabled={loading || !url.trim()} className="btn-primary">
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>AI is analyzing the market via 0G Compute Router...</p>
          <p className="sub-text">Fetching world data, news, and market conditions</p>
        </div>
      )}

      {result && <ReportCard result={result} />}
    </div>
  );
}

function ReportCard({ result }) {
  const signalClass = result.recommendation?.signal === 'STRONG' ? 'signal-strong'
    : result.recommendation?.signal === 'WEAK' ? 'signal-weak' : 'signal-none';
  const directionLabel = result.direction === 'YES' ? 'Yes' : 'No';

  return (
    <div className="report-card">
      <div className="report-header">
        <h3>{result.marketQuestion}</h3>
        <span className={`direction-badge dir-${result.direction?.toLowerCase()}`}>{directionLabel}</span>
      </div>

      <div className="report-stats">
        <div className="rs-item">
          <span className="rs-label">AI Probability</span>
          <span className={`rs-value ${result.aiProbability > 50 ? 'text-green' : 'text-red'}`}>
            {result.aiProbability}%
          </span>
        </div>
        <div className="rs-item">
          <span className="rs-label">Market Price</span>
          <span className="rs-value">{result.currentPrice?.toFixed(1)}%</span>
        </div>
        <div className="rs-item">
          <span className="rs-label">Spread</span>
          <span className={`rs-value ${Math.abs(parseFloat(result.spread || 0)) > 10 ? 'text-orange' : ''}`}>
            {result.spread > 0 ? '+' : ''}{result.spread}%
          </span>
        </div>
        <div className="rs-item">
          <span className="rs-label">Confidence</span>
          <span className={`rs-value conf-${result.confidence}`}>{result.confidence}</span>
        </div>
      </div>

      <div className="report-section">
        <h4>Analysis</h4>
        <p>{result.reasoningSummary}</p>
      </div>

      {result.keyFactors?.length > 0 && (
        <div className="report-section">
          <h4>Key Factors</h4>
          <ul>
            {result.keyFactors.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      <div className="report-section">
        <h4>Recommendation</h4>
        <div className={`signal-box ${signalClass}`}>
          <div className="signal-badge">
            {result.recommendation?.action === 'BUY_YES' ? 'BUY YES' :
             result.recommendation?.action === 'BUY_NO' ? 'BUY NO' : 'HOLD'}
          </div>
          <p className="signal-desc">{result.recommendation?.reasoning}</p>
        </div>
      </div>

      <div className="report-footer">
        {result.storageRootHash && (
          <a href={`https://storagescan.0g.ai/file?root=${result.storageRootHash}`} target="_blank" className="verify-link">
            View on 0G Storage
          </a>
        )}
        <span className="report-time">{new Date(result.analysisTimestamp).toLocaleString()}</span>
      </div>
    </div>
  );
}

function HistoryPage({ token }) {
  const [analyses, setAnalyses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setAnalyses(d.analyses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <div className="history-page">
      <h2>Your Analysis History</h2>
      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading history...</p></div>
      ) : analyses.length === 0 ? (
        <div className="empty-state">
          <p>No analyses yet. Analyze a Polymarket market to see your history.</p>
        </div>
      ) : (
        <div className="history-list">
          {analyses.map((a, i) => (
            <div key={a.id || i} className="history-item">
              <div className="hi-header">
                <span className="hi-question">{a.marketQuestion}</span>
                <span className={`direction-badge dir-${a.direction?.toLowerCase()}`}>{a.direction}</span>
              </div>
              <div className="hi-details">
                <span>AI: {a.aiProbability}%</span>
                <span>Market: {a.currentPrice?.toFixed(1)}%</span>
                <span>Spread: {a.spread > 0 ? '+' : ''}{a.spread}%</span>
                <span className={`signal-${a.recommendation?.signal?.toLowerCase() || 'none'}`}>
                  {a.recommendation?.action || 'HOLD'}
                </span>
              </div>
              <span className="hi-time">{new Date(a.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
