require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PolymarketSource } = require('./sources/polymarket');
const { NewsSource } = require('./sources/news');
const { PredictionAnalyzer } = require('./analyzers/prediction');
const { StorageUploader } = require('./storage/uploader');

const polymarket = new PolymarketSource();
const newsSource = new NewsSource();
const analyzer = new PredictionAnalyzer();
const uploader = new StorageUploader();

const PORT = process.env.PORT || 3000;

async function runSingleAnalysis(marketId) {
  console.log(`Analyzing market: ${marketId}`);

  const market = await polymarket.getMarket(marketId);
  const prices = await polymarket.getMarketPrice(marketId);
  const marketPrice = prices ? parseFloat(prices.price) * 100 : null;

  const news = await newsSource.searchNews(market.question, 5);
  const newsContext = news.map(n => `[${n.title}] ${n.snippet}`).join('\n');

  const result = await analyzer.analyzeMarket(market.question, newsContext, marketPrice);

  const storageResult = await uploader.uploadPrediction(marketId, {
    marketId,
    marketQuestion: market.question,
    analysis: result
  });

  return {
    market: {
      id: marketId,
      question: market.question,
      currentPrice: marketPrice
    },
    analysis: result,
    storage: storageResult
  };
}

async function runBatchAnalysis(tag = 'sports', limit = 5) {
  console.log(`Fetching ${limit} markets from tag: ${tag}`);

  const markets = await polymarket.getMarkets(tag, limit);
  const results = [];

  for (const market of markets) {
    try {
      const prices = await polymarket.getMarketPrice(market.id);
      const marketPrice = prices ? parseFloat(prices.price) * 100 : null;
      const news = await newsSource.searchNews(market.question, 3);
      const newsContext = news.map(n => `[${n.title}] ${n.snippet}`).join('\n');

      const analysis = await analyzer.analyzeMarket(market.question, newsContext, marketPrice);

      results.push({
        marketId: market.id,
        marketQuestion: market.question,
        currentPrice: marketPrice,
        analysis
      });

      console.log(`Analyzed: ${market.question} -> ${analysis.direction} (${analysis.probability}%)`);
    } catch (err) {
      console.error(`Failed to analyze ${market.id}: ${err.message}`);
    }
  }

  const batchStorage = await uploader.uploadAnalysisBatch(results);

  return {
    count: results.length,
    results,
    storage: batchStorage
  };
}

function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/analyze', async (req, res) => {
    try {
      const { marketId, tag, limit } = req.body;
      let result;

      if (marketId) {
        result = await runSingleAnalysis(marketId);
      } else {
        result = await runBatchAnalysis(tag, limit || 5);
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/analyze/:marketId', async (req, res) => {
    try {
      const result = await runSingleAnalysis(req.params.marketId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--analyze')) {
    const marketId = args[args.indexOf('--analyze') + 1];
    if (marketId && !marketId.startsWith('--')) {
      const result = await runSingleAnalysis(marketId);
      console.log(JSON.stringify(result, null, 2));
    } else {
      const tag = args.includes('--tag') ? args[args.indexOf('--tag') + 1] : 'sports';
      const limit = parseInt(args.includes('--limit') ? args[args.indexOf('--limit') + 1] : '5');
      const result = await runBatchAnalysis(tag, limit);
      console.log(JSON.stringify(result, null, 2));
    }
    return;
  }

  if (args.includes('--history')) {
    console.log('History mode: fetch past predictions from 0G Storage');
    console.log('Feature coming soon');
    return;
  }

  if (args.includes('--serve') || !args.length) {
    const app = createServer();
    app.listen(PORT, () => {
      console.log(`ZeroOracle agent running on port ${PORT}`);
      console.log(`0G Router: ${process.env.OG_ROUTER_BASE_URL || 'https://router-api.0g.ai/v1'}`);
      console.log(`Model: ${process.env.OG_MODEL || 'zai-org/GLM-5-FP8'}`);
    });
    return;
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runSingleAnalysis, runBatchAnalysis, createServer };
