import hardhat from "hardhat"
const { network, ethers } = hardhat;
import { networkConfig, developmentChains, VRF_COORDINATOR_ABI, LINK_TOKEN_ABI } from "../../helper-hardhat-config.cjs"
import { expect, assert } from "chai";
developmentChains.includes(network.name)
    ? describe.skip
    : describe("CoinFlip Staging Tests", function () {
        let coinFlip, deployer, addr1;

        before(async function () {
            [deployer, addr1] = await ethers.getSigners();
            const chainId = network.config.chainId;
            let subscriptionId = networkConfig[chainId]["subscriptionId"];
            const vrfCoordinatorAddress = networkConfig[chainId]["VRFCoordinatorAddress"];
            const keyHash = networkConfig[chainId]["keyHash"];
            const callBackGasLimit = networkConfig[chainId]["callbackGasLimit"];
            const requestConfirmations = network.config.blockConfirmations;

            const vrfCoordinator = new ethers.Contract(vrfCoordinatorAddress, VRF_COORDINATOR_ABI, deployer);

            if (!subscriptionId) {
                const transaction = await vrfCoordinator.createSubscription();
                console.log("Subscription ID is not set, creating a new subscription...");

                const transactionReceipt = await transaction.wait(1);
                subscriptionId = transactionReceipt.logs[0].args.subId;
                console.log(`Subscription created successfully, and subscription ID is ${subscriptionId}`);
            }
            const subscriptionInfo = await vrfCoordinator.getSubscription(subscriptionId);
            if (subscriptionInfo.balance <= 0) {
                const fundAmount = networkConfig[chainId]["fundAmount"];
                const linkTokenAddress = networkConfig[chainId]["linkToken"];
                const linkToken = new ethers.Contract(linkTokenAddress, LINK_TOKEN_ABI, deployer);
                console.log(`Transferring ${fundAmount} LINK to subscription ${subscriptionId}...`);

                await linkToken.transferAndCall(
                    vrfCoordinatorAddress,
                    fundAmount,
                    ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [subscriptionId])
                );
            }
            const coinFlipFactory = await ethers.getContractFactory("CoinFlip");
            console.log("Deploying the CoinFlip smart contract...");

            coinFlip = await coinFlipFactory.connect(deployer).deploy(vrfCoordinatorAddress, keyHash, subscriptionId, callBackGasLimit, requestConfirmations);
            console.log(`CoinFlip deployed successfully at ${coinFlip.target}`);

            await coinFlip.depositFunds({ value: ethers.parseEther("0.002") });
            if (!subscriptionInfo.consumers.includes(coinFlip.target)) {
                console.log(`Adding consumer ${coinFlip.target} to the VRF coordinator...`);
                await vrfCoordinator.addConsumer(subscriptionId, coinFlip.target);
            }
        });

        it("Should fire the CoinFlipped event on callback and transfer winnings correctly", async function () {
            await new Promise(async (resolve, reject) => {
                try {
                    // Set up a listener for the CoinFlipped event
                    coinFlip.once("CoinFlipped", async (player, betAmount, side, result, won) => {
                        console.log("CoinFlipped event fired!");

                        try {
                            const finalBalance = await ethers.provider.getBalance(player);
                            assert(player !== "0x0000000000000000000000000000000000000000" && player === addr1.address, "Player address should be set");
                            assert(betAmount > 0, "Bet amount should be greater than zero");
                            assert(side === "heads" || side === "tails", "Side should be heads or tails");
                            assert(result === "heads" || result === "tails", "Result should be heads or tails");
                            if (won) {
                                assert(finalBalance > initialBalance);
                            } else {
                                assert(initialBalance > finalBalance);
                            }

                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });


                    console.log("Requesting coin flip...");

                    const betAmount = ethers.parseEther("0.00000001");
                    const initialBalance = await ethers.provider.getBalance(addr1.address);

                    const tx = await coinFlip.connect(addr1).flip("heads", { value: betAmount });
                    await tx.wait(1);
                } catch (error) {
                    reject(error);
                }
            });
        });
    });
