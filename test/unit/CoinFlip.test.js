

import { networkConfig, developmentChains } from "../../helper-hardhat-config.cjs";
import hardhat from "hardhat";
const { ethers } = hardhat;
import { expect, assert } from "chai";

!developmentChains.includes(network.name)
    ? describe.skip :
    describe("CoinFlip", function () {
        let coinFlip;
        let owner;
        let addr1;
        let vrfCoordinatorMock;

        beforeEach(async function () {
            [owner, addr1] = await ethers.getSigners();

            const BASE_FEE = "1000000000000000";// 0.001 ether as base fee
            const GAS_PRICE = "50000000000"; // 50 gwei 
            const WEI_PER_UNIT_LINK = "10000000000000000";// 0.01 ether per LINK

            const chainId = network.config.chainId;

            //Deploy a mock VRFCoordinator for testing
            const VRFCoordinatorMock = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
            vrfCoordinatorMock = await VRFCoordinatorMock.deploy(BASE_FEE, GAS_PRICE, WEI_PER_UNIT_LINK);
            await vrfCoordinatorMock.waitForDeployment();


            const fundAmount = networkConfig[chainId]["fundAmount"];
            const transaction = await vrfCoordinatorMock.createSubscription();
            const transactionReceipt = await transaction.wait(1);
            const subscriptionId = transactionReceipt.logs[0].args.subId;
            await vrfCoordinatorMock.fundSubscription(subscriptionId, fundAmount);
            const vrfCoordinatorAddress = vrfCoordinatorMock.target;
            const keyHash = networkConfig[chainId]["keyHash"];

            const callBackGasLimit = networkConfig[chainId]["callbackGasLimit"];
            const reqestConfirmations = network.config.blockConfirmations;
            const CoinFlipFactory = await ethers.getContractFactory(
                "CoinFlip"
            );
            coinFlip = await CoinFlipFactory
                .connect(owner)
                .deploy(vrfCoordinatorAddress, keyHash, subscriptionId, callBackGasLimit, reqestConfirmations);


            await vrfCoordinatorMock.addConsumer(subscriptionId, coinFlip.target);

        });

        it("Should allow the owner to deposit funds", async function () {
            await expect(coinFlip.depositFunds({ value: ethers.parseEther("0.1") })

            ).to.changeEtherBalance(coinFlip, ethers.parseEther("0.1"));

            const contractBalance = await ethers.provider.getBalance(coinFlip.target);
            expect(contractBalance).to.equal(ethers.parseEther("0.1"));
        });

        it("Should not allow non-owners to deposit funds", async function () {
            await expect(coinFlip.connect(addr1).depositFunds({ value: ethers.parseEther("0.1") })).to.be.reverted;
        });

        it("Should allow the owner to withdraw funds", async function () {
            // Deposit funds
            await coinFlip.depositFunds({ value: ethers.parseEther("0.1") })
            // Withdraw funds
            await expect(() => coinFlip.withdrawFunds(ethers.parseEther("0.1")))
                .to.changeEtherBalance(owner, ethers.parseEther("0.1"));

            const contractBalance = await ethers.provider.getBalance(coinFlip.target);
            expect(contractBalance).to.equal(ethers.parseEther("0"));
        });

        it("Should flip the coin and pay out if the player wins", async function () {
            // Deposit funds
            await coinFlip.depositFunds({ value: ethers.parseEther("0.002") });
            await new Promise(async (resolve, reject) => {
                try {
                    coinFlip.once("CoinFlipped", async (player, betAmount, side, result, won) => {
                        console.log("CoinFlipped event fired!");

                        try {
                            const playerAfterBalance = await ethers.provider.getBalance(addr1.address);
                            const contractAfterBalance = await ethers.provider.getBalance(coinFlip.target);
                            assert(player !== "0x0000000000000000000000000000000000000000", "Player address should be set");
                            assert(betAmount > 0, "Bet amount should be greater than zero");
                            assert(side === "heads" || side === "tails", "Side should be heads or tails");
                            assert(result === "heads" || result === "tails", "Result should be heads or tails");
                            if (won) {
                                assert(playerAfterBalance > playerBeforeBalance && contractAfterBalance < contractBeforeBalance);
                            } else {
                                assert(playerAfterBalance < playerBeforeBalance && contractAfterBalance > contractBeforeBalance);
                            }
                        } catch (e) {
                            return reject(e);
                        }

                        resolve();
                    });
                    const playerBeforeBalance = await ethers.provider.getBalance(addr1.address);
                    const contractBeforeBalance = await ethers.provider.getBalance(coinFlip.target);
                    // Trigger the flip
                    const tx = await coinFlip.connect(addr1).flip("heads", { value: ethers.parseEther("0.0001") });
                    const receipt = await tx.wait(1);

                    const requestId = receipt.logs[1].args[0];
                    await expect(tx).to.emit(coinFlip, "RandomnessRequested");

                    // Simulate VRF response
                    await vrfCoordinatorMock.fulfillRandomWords(requestId, coinFlip.target);
                } catch (e) {
                    reject(e);
                }
            });
        });

        it("Should revert if the contract doesn't have enough balance to cover winnings", async function () {
            await expect(
                coinFlip.flip("heads", { value: ethers.parseEther("0.1") })
            ).to.be.revertedWith("Contract balance too low to cover potential winnings");
        });
    });