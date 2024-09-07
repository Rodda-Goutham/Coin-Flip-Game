import hardhat from "hardhat";
import { networkConfig } from "../../helper-hardhat-config.cjs";
const { ethers } = hardhat;
export async function deployMocks(chainId) {
    console.log("local network detected!");
    const BASE_FEE = "100000000000000000";
    const GAS_PRICE_LINK = "1000000000";
    const _WEIPERUNITLINK = 4404802195122839;
    let VRFCoordinatorV2_5Mock;
    let subscriptionId;
    let vrfCoordinatorAddress;
    //Deploy VRFCoordinnatorV2_5 Mocks
    const VRFCoordinatorV2_5MockFactory = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
    VRFCoordinatorV2_5Mock = await VRFCoordinatorV2_5MockFactory.deploy(BASE_FEE, GAS_PRICE_LINK, _WEIPERUNITLINK);
    console.log("Mocks deployed!");
    vrfCoordinatorAddress = VRFCoordinatorV2_5Mock.target;
    const fundAmount = networkConfig[chainId]["fundAmount"];
    const transaction = await VRFCoordinatorV2_5Mock.createSubscription();
    const transactionReceipt = await transaction.wait(1);
    subscriptionId = transactionReceipt.logs[0].args.subId;
    await VRFCoordinatorV2_5Mock.fundSubscription(subscriptionId, fundAmount);
    return [chainId, vrfCoordinatorAddress, subscriptionId, VRFCoordinatorV2_5Mock];
}
