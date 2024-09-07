import hardhat from "hardhat";
const { ethers } = hardhat;

// Load environment variables from .env file
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const contractABI = [
    {
        "inputs": [],
        "name": "depositFunds",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    "function depositFunds() external payable"
];

// Set up the provider, wallet, and contract
const provider = new ethers.AlchemyProvider('sepolia', ALCHEMY_API_KEY);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

async function depositFunds(amountInEther) {
    try {
        console.log(`Depositing ${amountInEther} ETH to contract...`);

        // Send the transaction to the depositFunds function
        const tx = await contract.depositFunds({
            value: ethers.parseEther(amountInEther),
        });

        console.log('Transaction sent:', tx.hash);

        // Wait for the transaction to be mined
        await tx.wait();
        console.log('Transaction confirmed:', tx.hash);
    } catch (error) {
        console.error('Error depositing funds:', error);
    }
}

// Call the function with the amount you want to deposit
depositFunds('0.01'); // Change '0.1' to the amount of ETH you want to deposit
