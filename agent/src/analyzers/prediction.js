const { OpenAI } = require('openai');

class PredictionAnalyzer {
  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.OG_ROUTER_BASE_URL || 'https://router-api.0g.ai/v1',
      apiKey: process.env.OG_ROUTER_API_KEY,
    });
    this.model = process.env.OG_MODEL || 'zai-org/GLM-5-FP8';
  }

  async analyzeMarket(marketQuestion, newsContext, marketPrice) {
    const systemPrompt = `You are a prediction market analyst. Given market questions, news context, and current market prices, you output structured analysis in JSON format. Your analysis must include: probability estimate (0-100), directional bias (YES/NO), key factors, confidence level, and reasoning summary. Be objective and data-driven.`;

    const userPrompt = `Market Question: "${marketQuestion}"

Current Market Price: ${marketPrice !== null ? marketPrice + '% for YES' : 'Not available'}

Recent News/Analysis Context:
${newsContext}

Respond with a JSON object containing:
- probability: number (0-100)
- direction: "YES" or "NO"
- confidence: "low", "medium", "high"
- keyFactors: array of strings
- reasoningSummary: string`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const analysis = JSON.parse(content);

    return {
      ...analysis,
      marketQuestion,
      marketPrice,
      model: this.model,
      provider: response.x_0g_trace?.provider || null,
      cost: response.x_0g_trace?.billing || null,
      timestamp: new Date().toISOString()
    };
  }

  async analyzeBatch(markets, newsMap) {
    const results = [];
    for (const market of markets) {
      const news = newsMap[market.id] || [];
      const price = market.prices ? market.prices[0] : null;
      const analysis = await this.analyzeMarket(market.question, news, price);
      results.push({
        marketId: market.id,
        marketQuestion: market.question,
        analysis
      });
    }
    return results;
  }
}

module.exports = { PredictionAnalyzer };
