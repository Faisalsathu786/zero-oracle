require('dotenv').config();
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

const POLYMARKET_API = 'https://clob.polymarket.com';

class PolymarketSource {
  constructor() {
    this.baseUrl = POLYMARKET_API;
  }

  async getMarkets(tag = 'sports', limit = 20) {
    const url = `${this.baseUrl}/markets?tag=${tag}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`);
    return res.json();
  }

  async getMarket(marketId) {
    const url = `${this.baseUrl}/markets/${marketId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Polymarket market fetch error: ${res.status}`);
    return res.json();
  }

  async getMarketPrice(marketId) {
    const url = `${this.baseUrl}/prices?market=${marketId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Polymarket price error: ${res.status}`);
    return res.json();
  }
}

module.exports = { PolymarketSource };
