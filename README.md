# Coin-Flip-Game
# Overview
The Coin Flip Game is a decentralized application (dApp) built on Ethereum, allowing users to engage in a simple coin-flip betting game. The game leverages Chainlink's Verifiable Random Function (VRF) to ensure the outcome of each coin flip is provably fair. Players can bet on either "heads" or "tails" and have the chance to double their bet if they win.

# Table of Contents
- [Features](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#features)
- [Smart Contract Architecture](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#smart-contract-architecture)
- [Deployment](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#deployment)
- [Usage](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#usage)
- [Testing](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#testing)
- [Technologies Used](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#technologies-used)
- [Contributing](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#contributing)
- [License](https://github.com/Rodda-Goutham/Coin-Flip-Game/edit/main/README.md#license)
# Features
- **Fair Randomness**: Uses Chainlink VRF to generate random outcomes for the coin flip.
- **Betting: Players** can place bets on either heads or tails.
- **Double or Nothing**: Players double their bet if they win, or lose the bet amount if they lose.
- **Owner Privileges**: Contract owner can deposit and withdraw funds from the contract.
# Smart Contract Architecture
## CoinFlip.sol
- **constructor**: Initializes the contract with Chainlink VRF parameters.
- **depositFunds**: Allows the contract owner to deposit ETH into the contract.
- **withdrawFunds**: Allows the contract owner to withdraw specified ETH amount from the contract.
- **flip**: Allows a user to place a bet on heads or tails. Requests a random number from Chainlink VRF.
- **fulfillRandomWords**: Callback function that receives the random number from Chainlink VRF and determines the outcome of the coin flip.
- **compareStrings**: Helper function to compare strings.
## Key Variables
- ```i_owner```: Immutable address of the contract owner.
- ```s_keyHash```: Chainlink VRF key hash.
- ```s_subscriptionId```: Chainlink VRF subscription ID.
- ```s_requestConfirmations```: Number of confirmations required for the VRF request.
- ```s_callbackGasLimit```: Gas limit for the VRF callback function.
- ```NUM_WORDS```: Constant number of random words requested from Chainlink VRF.
- ```requestToSender```: Mapping of request IDs to the addresses of the users who made the bet.
- ```requestToBetAmount```: Mapping of request IDs to the bet amounts.
- ```requestToSide```: Mapping of request IDs to the side (heads/tails) chosen by the user.
# Deployment
## Prerequisites
- Node.js and Yarn installed
- Hardhat installed globally
## Deploying to Local Network
1. Clone the repository:
```
git clone https://github.com/your-username/coin-flip-game.git
cd coin-flip-game/contracts
```
2. Install dependencies:
```
yarn install
```
3. Compile the smart contracts:
```
yarn compile
```
4. Deploy the smart contract to a local network:
```
yarn hardhat node
yarn deploy
```
##  Deploying to Sepolia Testnet
Create a .env file and add your Sepolia RPC URL and private key:
```
SEPOLIA_RPC_URL=<your-sepolia-rpc-url>
PRIVATE_KEY=<your-private-key>
```
1. Deploy to Sepolia Testnet:
```
yarn deploy-testnet
```
# Usage
## Interacting with the Smart Contract
Once the contract is deployed, users can interact with it using the following functions:
- **Deposit Funds**: Allows the owner to deposit funds into the contract.
- **Withdraw Funds**: Allows the owner to withdraw funds from the contract.
- **Flip**: Allows a user to place a bet on "heads" or "tails". Requires sending ETH equal to the bet amount.
## Frontend Integration
For frontend integration, use a Web3 library (like ethers.js) to interact with the deployed contract. The frontend should include a form to accept bet amounts and a button to initiate the coin flip.
# Testing
## Running Unit Tests
Unit tests are provided to ensure the contract functions as expected. To run the tests:
```
yarn test
```
## Staging Tests
Staging tests are used to test the contract on a test network (like Sepolia):
```
yarn test-staging
```
# Technologies Used
- **Solidity**: Smart contract programming language.
- **Chainlink VRF**: Secure and verifiable random number generator.
- **Hardhat**: Ethereum development environment.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.
- **Yarn**: Package manager for managing project dependencies.
# Contributing
Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request.
## Steps to Contribute:
1. Fork the repository.
2. Create a new branch.
3. Commit your changes.
4. Push to the branch.
5. Submit a pull request.
# License
This project is licensed under the MIT License. See the LICENSE file for details.
# Additional Notes:
- Ensure that you update the repository URL in the README.md if you fork the project.
- Update the deployment scripts and environment variables according to your setup.
