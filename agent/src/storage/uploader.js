const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class StorageUploader {
  constructor(options = {}) {
    this.rpcUrl = options.rpcUrl || process.env.OG_STORAGE_RPC || 'https://evmrpc.0g.ai';
    this.indexerUrl = options.indexerUrl || process.env.OG_STORAGE_INDEXER || 'https://indexer-storage-turbo.0g.ai';
    this.privateKey = options.privateKey || process.env.AGENT_PRIVATE_KEY || '';
    this.cliPath = options.cliPath || '0g-storage-client';
    this.dataDir = path.join(__dirname, '../../data');
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async uploadPrediction(marketId, analysisData) {
    this.ensureDataDir();

    const filename = `prediction_${marketId}_${Date.now()}.json`;
    const filePath = path.join(this.dataDir, filename);

    const content = JSON.stringify({
      type: 'prediction',
      marketId: marketId,
      marketQuestion: analysisData.marketQuestion,
      analysis: analysisData.analysis,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }, null, 2);

    fs.writeFileSync(filePath, content);

    try {
      const cmd = [
        this.cliPath, 'upload',
        '--url', this.rpcUrl,
        '--key', this.privateKey,
        '--indexer', this.indexerUrl,
        '--file', filePath
      ].join(' ');

      const output = execSync(cmd, { timeout: 60000 }).toString();
      const rootHash = this._extractRootHash(output);

      fs.unlinkSync(filePath);

      return {
        rootHash,
        filename,
        uploadTimestamp: new Date().toISOString(),
        rawOutput: output
      };
    } catch (err) {
      throw new Error(`Storage upload failed: ${err.message}`);
    }
  }

  async uploadAnalysisBatch(results) {
    this.ensureDataDir();

    const batchFile = `batch_${Date.now()}.json`;
    const filePath = path.join(this.dataDir, batchFile);

    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

    try {
      const cmd = [
        this.cliPath, 'upload',
        '--url', this.rpcUrl,
        '--key', this.privateKey,
        '--indexer', this.indexerUrl,
        '--file', filePath
      ].join(' ');

      const output = execSync(cmd, { timeout: 120000 }).toString();
      const rootHash = this._extractRootHash(output);

      fs.unlinkSync(filePath);

      return {
        rootHash,
        batchFile,
        uploadTimestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Batch upload failed: ${err.message}`);
    }
  }

  _extractRootHash(output) {
    const match = output.match(/root\s*[:=]\s*(0x[a-fA-F0-9]+)/i);
    return match ? match[1] : null;
  }
}

module.exports = { StorageUploader };
