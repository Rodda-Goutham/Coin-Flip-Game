// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {ICoinFlip} from "./interfaces/ICoinFlip.sol";

/**
 * @title CoinFlip
 * @dev A simple coin flip game smart contract that uses Chainlink VRF for randomness.
 * Players can bet on either "heads" or "tails" and potentially double their bet amount if they win.
 */
contract CoinFlip is ICoinFlip, VRFConsumerBaseV2Plus {
    // Owner of the contract
    address public immutable i_owner;

    // Chainlink VRF parameters
    bytes32 immutable s_keyHash;
    uint256 immutable s_subscriptionId;
    uint16 immutable s_requestConfirmations;
    uint32 immutable s_callbackGasLimit;

    // Constant number of random words requested
    uint32 internal constant NUM_WORDS = 1;

    // Mapping to store request details
    mapping(uint256 => address) public requestToSender;
    mapping(uint256 => uint256) public requestToBetAmount;
    mapping(uint256 => string) public requestToSide;

    /**
     * @dev Constructor initializes the contract with necessary VRF parameters.
     * @param vrfCoordinator The address of the Chainlink VRF Coordinator.
     * @param _keyHash The key hash of the Chainlink VRF job.
     * @param _subscriptionId The subscription ID for funding VRF requests.
     * @param _callBackGasLimit The gas limit for the callback function.
     * @param _blockConfirmations The number of confirmations required before fulfilling the randomness request.
     */
    constructor(
        address vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        uint32 _callBackGasLimit,
        uint16 _blockConfirmations
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_owner = msg.sender;
        s_keyHash = _keyHash;
        s_subscriptionId = _subscriptionId;
        s_callbackGasLimit = _callBackGasLimit;
        s_requestConfirmations = _blockConfirmations;
    }

    /**
     * @dev Deposits funds into the contract. Only the owner can call this function.
     */
    function depositFunds() external payable onlyOwner {
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraws specified amount of funds from the contract. Only the owner can call this function.
     * @param amount The amount of ETH to withdraw.
     */
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(
            address(this).balance >= amount,
            "Insufficient balance in contract"
        );
        payable(i_owner).transfer(amount);
        emit FundsWithdrawn(i_owner, amount);
    }

    /**
     * @dev Initiates a coin flip by requesting randomness from Chainlink VRF.
     * The player's bet amount and choice are recorded.
     * @param _side The side the player is betting on, either "heads" or "tails".
     */
    function flip(string memory _side) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(
            address(this).balance >= msg.value * 2,
            "Contract balance too low to cover potential winnings"
        );

        // Request randomness from Chainlink VRF
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: s_requestConfirmations,
                callbackGasLimit: s_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        // Store request details
        requestToSender[requestId] = msg.sender;
        requestToBetAmount[requestId] = msg.value;
        requestToSide[requestId] = _side;

        emit RandomnessRequested(requestId);
    }

    /**
     * @dev Fulfills the randomness request and determines the outcome of the coin flip.
     * Transfers the winnings to the player if they won.
     * @param requestId The ID of the randomness request.
     * @param randomWords The array of random words returned by Chainlink VRF.
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        // Determine the result of the coin flip
        string memory result = (randomWords[0] % 2 == 0) ? "heads" : "tails";
        address player = requestToSender[requestId];
        uint256 betAmount = requestToBetAmount[requestId];
        string memory side = requestToSide[requestId];

        // Check if the player won
        bool won = compareStrings(side, result);

        // If the player won, transfer the winnings
        if (won) {
            payable(player).transfer(betAmount * 2);
        }

        emit CoinFlipped(player, betAmount, side, result, won);
    }

    /**
     * @dev Compares two strings and returns true if they are equal.
     * @param a The first string to compare.
     * @param b The second string to compare.
     * @return bool True if the strings are equal, false otherwise.
     */
    function compareStrings(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
