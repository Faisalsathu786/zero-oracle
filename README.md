# ZeroOracle

Decentralized AI prediction oracle built on 0G infrastructure. Uses 0G Storage for permanent audit trails, 0G Compute Router for AI-powered prediction market analysis, and 0G Chain for on-chain prediction registry.

## Architecture

```
User Request
    |
    v
[AI Agent] --(0G Compute Router)--> GLM-5 / DeepSeek inference
    |
    v
[0G Storage] <-- Prediction JSON with full analysis trail
    |
    v
[0G Chain / OracleRegistry] <-- Prediction hash + probability + direction
    |
    v
[React Dashboard] <-- Live predictions + audit log
```

## Deployed Contracts

| Component | Address | Network |
|-----------|---------|---------|
| OracleRegistry | `0xB2b449C90deFFe54C8c2ccfEd62A8a7F84B8108a` | 0G Mainnet (Aristotle) |
| Agent Wallet | `0xD2b0082c89516Fd2349dF1179200E1B57c803119` | 0G Mainnet |

### On-Chain Predictions

| ID | Market | AI Prediction | Status |
|----|--------|--------------|--------|
| 0 | Hantavirus pandemic in 2026? | NO (2%) | Registered |
| 1 | Will Switzerland advance to knockout at 2026 FIFA World Cup? | YES (78%) | Registered |

## 0G Stack Integration

### 0G Chain (EVM-compatible L1)
- Smart contract: `contracts/contracts/OracleRegistry.sol`
- Records predictions on-chain with agent reputation tracking
- Deployed with Hardhat, evmVersion: cancun
- Chain ID: 16661 (mainnet)

### 0G Compute Router
- OpenAI-compatible API endpoint at https://router-api.0g.ai/v1
- Model: 0gm-1.0-35b-a3b (262K context, reasoning capable)
- TEE-verified execution with cryptographic attestation
- Cost: ~0.0008 0G per analysis

### 0G Storage
- Prediction analysis JSONs uploaded to 0G Storage network
- Each file identified by its Merkle root hash
- Permanent, verifiable audit trail

## Project Structure

```
zero-oracle/
├── contracts/               # Smart contracts for 0G Chain
│   ├── contracts/
│   │   └── OracleRegistry.sol    # Prediction registry + agent scoring
│   ├── scripts/
│   │   └── deploy.js             # Hardhat deploy script
│   └── hardhat.config.js         # 0G Chain network config
├── agent/                   # AI prediction agent
│   ├── src/
│   │   ├── index.js              # Main agent + Express server
│   │   ├── analyzers/
│   │   │   └── prediction.js     # AI analysis via 0G Router
│   │   ├── sources/
│   │   │   ├── polymarket.js     # Polymarket market data
│   │   │   └── news.js           # Web news scraper
│   │   └── storage/
│   │       └── uploader.js       # 0G Storage upload
│   └── .env.example
├── frontend/                # React dashboard
│   └── src/
│       ├── App.js
│       └── components/
│           ├── Dashboard.js
│           ├── PredictionCard.js
│           └── HistoryLog.js
└── README.md
```

## Quick Start

### Prerequisites
- Node.js >= 18
- 0G Mainnet wallet with 0G tokens
- 0G Router API key (from pc.0g.ai)

### 1. Deploy Smart Contract
```bash
cd contracts
npm install
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network 0g-mainnet
```

### 2. Run AI Agent
```bash
cd agent
cp .env.example .env
# Edit .env with your API key and wallet
npm install
node src/index.js --serve     # Start API server
node src/index.js --analyze   # One-shot analysis
```

### 3. View Dashboard
```bash
cd frontend
npm install
npm start
```

## On-Chain Access

View the OracleRegistry contract on 0G Chain Scan:
https://chainscan.0g.ai/address/0xB2b449C90deFFe54C8c2ccfEd62A8a7F84B8108a

## Built With

- [0G Chain](https://0g.ai) - EVM-compatible AI L1 blockchain (11k TPS)
- [0G Storage](https://0g.ai) - Decentralized AI-optimized storage
- [0G Compute Router](https://pc.0g.ai) - OpenAI-compatible decentralized inference
- [Polymarket](https://polymarket.com) - Prediction market data
- [Hardhat](https://hardhat.org) - Smart contract development
- [React](https://react.dev) - Frontend dashboard
