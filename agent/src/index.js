require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AuthService } = require('./auth');
const { PolymarketSource } = require('./sources/polymarket');
const { NewsSource } = require('./sources/news');
const { PredictionAnalyzer } = require('./analyzers/prediction');
const { StorageUploader } = require('./storage/uploader');

const auth = new AuthService();
const polymarket = new PolymarketSource();
const newsSource = new NewsSource();
const analyzer = new PredictionAnalyzer();
const uploader = new StorageUploader();

const PORT = process.env.PORT || 3000;

// Extract Polymarket market ID from URL
function extractMarketId(url) {
  const match = url.match(/polymarket\.com\/event\/([^/?]+)/i);
  if (match) return match[1];
  
  const match2 = url.match(/polymarket\.com\/market\/([^/?]+)/i);
  if (match2) return match2[1];
  
  return url;
}

async function analyzePolymarketUrl(url) {
  const marketId = extractMarketId(url);
  console.log(`Analyzing Polymarket: ${url} -> ID: ${marketId}`);

  const market = await polymarket.getMarket(marketId);
  if (!market || !market.question) {
    throw new Error('Could not fetch market data from Polymarket');
  }

  const prices = await polymarket.getMarketPrice(marketId);
  const marketPrice = prices ? parseFloat(prices.price) * 100 : null;

  const news = await newsSource.searchNews(market.question, 5);
  const newsContext = news.map(n => `[${n.title}] ${n.snippet}`).join('\n');

  const result = await analyzer.analyzeMarket(market.question, newsContext, marketPrice);

  let storageResult = null;
  try {
    storageResult = await uploader.uploadPrediction(marketId, {
      marketId,
      marketQuestion: market.question,
      analysis: result
    });
  } catch (e) {
    console.warn('Storage upload skipped:', e.message);
  }

  return {
    marketId,
    marketQuestion: market.question,
    currentPrice: marketPrice,
    aiProbability: result.probability,
    direction: result.direction,
    confidence: result.confidence,
    spread: marketPrice !== null ? (result.probability - marketPrice).toFixed(1) : null,
    reasoningSummary: result.reasoningSummary,
    keyFactors: result.keyFactors,
    storageRootHash: storageResult?.rootHash || null,
    analysisTimestamp: result.timestamp,
    recommendation: generateRecommendation(result, marketPrice)
  };
}

function generateRecommendation(analysis, marketPrice) {
  const diff = marketPrice !== null ? analysis.probability - marketPrice : 0;
  const absDiff = Math.abs(diff);

  if (absDiff > 15) {
    const recommendation = diff > 0 ? 'BUY_YES' : 'BUY_NO';
    return {
      action: recommendation,
      signal: 'STRONG',
      reasoning: diff > 0
        ? `AI estimates ${analysis.probability}% but market prices at ${marketPrice}%. Market may be undervaluing YES.`
        : `AI estimates ${analysis.probability}% but market prices at ${marketPrice}%. Market may be overpricing YES.`
    };
  }

  if (absDiff > 5) {
    const recommendation = diff > 0 ? 'BUY_YES' : 'BUY_NO';
    return {
      action: recommendation,
      signal: 'WEAK',
      reasoning: `Slight discrepancy between AI analysis (${analysis.probability}%) and market price (${marketPrice}%).`
    };
  }

  return {
    action: 'HOLD',
    signal: 'NONE',
    reasoning: `AI analysis (${analysis.probability}%) aligns with market price (${marketPrice}%). No clear opportunity.`
  };
}

async function runSingleAnalysis(marketId) {
  console.log(`Analyzing market: ${marketId}`);
  const market = await polymarket.getMarket(marketId);
  const prices = await polymarket.getMarketPrice(marketId);
  const marketPrice = prices ? parseFloat(prices.price) * 100 : null;
  const news = await newsSource.searchNews(market.question, 5);
  const newsContext = news.map(n => `[${n.title}] ${n.snippet}`).join('\n');
  const result = await analyzer.analyzeMarket(market.question, newsContext, marketPrice);
  let storageResult = null;
  try {
    storageResult = await uploader.uploadPrediction(marketId, {
      marketId, marketQuestion: market.question, analysis: result
    });
  } catch (e) {}
  return { market: { id: marketId, question: market.question, currentPrice: marketPrice }, analysis: result, storage: storageResult };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = auth.verifyToken(header.split(' ')[1]);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Health
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post('/auth/signup', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const result = await auth.signup(email, password, name || 'User');
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const result = await auth.login(email, password);
      res.json(result);
    } catch (e) {
      res.status(401).json({ error: e.message });
    }
  });

  app.get('/auth/me', authMiddleware, (req, res) => {
    const user = auth.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });

  // Analysis routes (protected)
  app.post('/analyze-url', authMiddleware, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'Polymarket URL required' });

      const result = await analyzePolymarketUrl(url);

      auth.addAnalysis(req.user.userId, {
        type: 'url',
        url,
        ...result
      });

      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message, market: 'Analysis failed' });
    }
  });

  app.post('/analyze', authMiddleware, async (req, res) => {
    try {
      const { marketId, tag, limit } = req.body;
      if (marketId) {
        const result = await runSingleAnalysis(marketId);
        res.json(result);
      } else {
        res.status(400).json({ error: 'marketId required' });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // User history
  app.get('/history', authMiddleware, (req, res) => {
    const analyses = auth.getAnalyses(req.user.userId);
    res.json({ analyses });
  });

  return app;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--serve') || !args.length) {
    const app = createServer();
    app.listen(PORT, () => {
      console.log(`ZeroOracle agent running on port ${PORT}`);
      console.log(`0G Router: ${process.env.OG_ROUTER_BASE_URL}`);
      console.log(`Model: ${process.env.OG_MODEL}`);
      console.log(`Auth: enabled (JWT)`);
    });
    return;
  }
}

if (require.main === module) {
  main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
}

module.exports = { createServer, analyzePolymarketUrl };
