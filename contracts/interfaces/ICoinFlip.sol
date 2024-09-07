// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ICoinFlip
 * @dev Interface for the CoinFlip smart contract.
 * Defines the external functions and events for interacting with the CoinFlip contract.
 */
interface ICoinFlip {
    // Events emitted by the CoinFlip contract
    /**
     * @dev Emitted when a coin flip result is determined.
     * @param player The address of the player who initiated the coin flip.
     * @param amount The amount of ETH the player bet.
     * @param side The side the player chose ("heads" or "tails").
     * @param result The outcome of the coin flip ("heads" or "tails").
     * @param won A boolean indicating whether the player won the bet or not.
     */
    event CoinFlipped(
        address indexed player,
        uint256 amount,
        string side,
        string result,
        bool won
    );
    
    /**
     * @dev Emitted when funds are deposited into the contract.
     * @param from The address of the entity that deposited funds into the contract.
     * @param amount The amount of ETH deposited.
     */

    event FundsDeposited(address indexed from, uint256 amount);

    /**
     * @dev Emitted when funds are withdrawn from the contract.
     * @param to The address of the entity that received the withdrawn funds.
     * @param amount The amount of ETH withdrawn.
     */
    event FundsWithdrawn(address indexed to, uint256 amount);


    /**
     * @dev Emitted when a request for randomness is made to Chainlink VRF.
     * @param requestId The unique ID associated with the randomness request.
     */
    event RandomnessRequested(uint256 indexed requestId);


    //External functions in CoinFlip contract
    /**
     * @dev Allows the owner to deposit funds into the contract.
     */
    function depositFunds() external payable;

    /**
     * @dev Allows the owner to withdraw a specified amount of funds from the contract.
     * @param amount The amount of ETH to withdraw.
     */
    function withdrawFunds(uint256 amount) external;

    /**
     * @dev Allows a user to place a bet and flip the coin.
     * The result is determined by Chainlink VRF.
     * @param _side The side the player is betting on, either "heads" or "tails".
     */
    function flip(string memory _side) external payable;

}
