import hardhat from "hardhat";
import { networkConfig } from "../../helper-hardhat-config.cjs";
import { verify } from "../../utils/verify.js";
const { ethers, network } = hardhat;
export async function deployCoinFlip([chainId, vrfCoordinatorAddress, subscriptionId, VRFCoordinatorV2_5Mock]) {
    const requestConfirmations = network.config.blockConfirmations;
    const keyHash = networkConfig[chainId]["keyHash"];
    const callBackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    vrfCoordinatorAddress = !vrfCoordinatorAddress ? networkConfig[chainId]["VRFCoordinatorAddress"] : vrfCoordinatorAddress;
    subscriptionId = !subscriptionId ? networkConfig[chainId]["subscriptionId"] : subscriptionId;
    //Deploy CoinFlip Contract
    const CoinFlip = await ethers.getContractFactory('CoinFlip');
    const coinFlip = await CoinFlip.deploy(vrfCoordinatorAddress,
        keyHash,
        subscriptionId,
        callBackGasLimit,
        requestConfirmations);
    await coinFlip.waitForDeployment();
    console.log('CoinFlip contract deployed to:', coinFlip.target);
    //Verify CoinFlip Contract if it's on testnnet/mainnet
    if (chainId == 31337) {
        VRFCoordinatorV2_5Mock.addConsumer(subscriptionId, coinFlip.target);
        console.log(`${coinFlip.target} added to consumers list`);
    } else {
        await verify(coinFlip.target,
            [vrfCoordinatorAddress,
                keyHash,
                subscriptionId,
                callBackGasLimit,
                requestConfirmations]);
    }

}