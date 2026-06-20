const fetch = require('node-fetch');

class NewsSource {
  constructor() {
    this.userAgent = 'ZeroOracle/1.0';
  }

  async fetchPage(url) {
    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return res.text();
  }

  async searchNews(query, numResults = 5) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const html = await this.fetchPage(url);
    const snippets = this._extractSnippets(html).slice(0, numResults);
    return snippets;
  }

  _extractSnippets(html) {
    const results = [];
    const snippetRegex = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = snippetRegex.exec(html)) !== null) {
      const title = match[1].replace(/<[^>]*>/g, '').trim();
      const snippet = match[2].replace(/<[^>]*>/g, '').trim();
      if (title && snippet) {
        results.push({ title, snippet });
      }
    }
    return results;
  }
}

module.exports = { NewsSource };
