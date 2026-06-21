require('dotenv').config();
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

const POLYMARKET_API = 'https://clob.polymarket.com';
const NEGRATM_API = 'https://neg-api.polymarket.com';

class PolymarketSource {
  constructor() {
    this.baseUrl = POLYMARKET_API;
    this.negBaseUrl = NEGRATM_API;
  }

  async getMarkets(tag = 'sports', limit = 20) {
    const url = `${this.baseUrl}/markets?tag=${tag}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`);
    const json = await res.json();
    return json.data || json;
  }

  async getMarket(marketId) {
    // Try CLOB API first (condition_id format: 0x...)
    if (marketId.startsWith('0x')) {
      const url = `${this.baseUrl}/markets/${marketId}`;
      const res = await fetch(url);
      if (res.ok) {
        return res.json();
      }
    }
    
    // Fallback: try Neg API for slug or name search
    const slug = marketId.replace(/^0x/, '').replace(/[^a-zA-Z0-9-]/g, '-');
    const searchUrl = `${this.negBaseUrl}/events?limit=1&title=${encodeURIComponent(slug)}`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const data = await searchRes.json();
      const events = data.data || data;
      if (Array.isArray(events) && events.length > 0) {
        return { question: events[0].title, ...events[0] };
      }
    }
    
    throw new Error(`Could not find market: ${marketId}. Use a valid Polymarket condition ID (0x... format)`);
  }

  async getMarketPrice(marketId) {
    if (!marketId.startsWith('0x')) return null;
    const url = `${this.baseUrl}/prices?market=${marketId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    try {
      const json = await res.json();
      return json.price || json;
    } catch { return null; }
  }
}

module.exports = { PolymarketSource };
