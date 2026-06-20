// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OracleRegistry {
    struct Prediction {
        string marketId;
        string marketQuestion;
        uint256 probability;
        string direction;
        string reasoningHash;
        string agentId;
        uint256 timestamp;
        string actualOutcome;
        bool resolved;
    }

    struct AgentScore {
        uint256 totalPredictions;
        uint256 correctPredictions;
        bool registered;
    }

    address public owner;
    uint256 public predictionCount;

    mapping(uint256 => Prediction) public predictions;
    mapping(string => AgentScore) public agentScores;
    mapping(address => bool) public authorizedAgents;

    event PredictionRecorded(
        uint256 indexed id,
        string marketId,
        string agentId,
        uint256 probability,
        string reasoningHash,
        uint256 timestamp
    );

    event PredictionResolved(
        uint256 indexed id,
        string outcome,
        bool correct
    );

    event AgentRegistered(string agentId, address signer);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedAgents[msg.sender], "not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerAgent(string calldata agentId) external onlyOwner {
        authorizedAgents[msg.sender] = true;
        agentScores[agentId].registered = true;
        emit AgentRegistered(agentId, msg.sender);
    }

    function recordPrediction(
        string calldata marketId,
        string calldata marketQuestion,
        uint256 probability,
        string calldata direction,
        string calldata reasoningHash,
        string calldata agentId
    ) external onlyAuthorized returns (uint256) {
        require(probability <= 100, "invalid probability");

        uint256 id = predictionCount;
        predictions[id] = Prediction({
            marketId: marketId,
            marketQuestion: marketQuestion,
            probability: probability,
            direction: direction,
            reasoningHash: reasoningHash,
            agentId: agentId,
            timestamp: block.timestamp,
            actualOutcome: "",
            resolved: false
        });

        predictionCount++;
        emit PredictionRecorded(id, marketId, agentId, probability, reasoningHash, block.timestamp);
        return id;
    }

    function resolvePrediction(uint256 id, string calldata outcome, bool correct) external onlyOwner {
        require(!predictions[id].resolved, "already resolved");

        predictions[id].actualOutcome = outcome;
        predictions[id].resolved = true;

        AgentScore storage score = agentScores[predictions[id].agentId];
        score.totalPredictions++;
        if (correct) {
            score.correctPredictions++;
        }

        emit PredictionResolved(id, outcome, correct);
    }

    function getPrediction(uint256 id) external view returns (Prediction memory) {
        return predictions[id];
    }

    function getAgentScore(string calldata agentId) external view returns (uint256 total, uint256 correct, bool registered) {
        AgentScore memory score = agentScores[agentId];
        return (score.totalPredictions, score.correctPredictions, score.registered);
    }

    function getPredictionCount() external view returns (uint256) {
        return predictionCount;
    }
}
