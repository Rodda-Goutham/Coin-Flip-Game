
const VRF_COORDINATOR_ABI = require("@chainlink/contracts/abi/v0.8/VRFCoordinatorV2_5.json")
const LINK_TOKEN_ABI = require("@chainlink/contracts/abi/v0.8/LinkToken.json")

const networkConfig = {
    default: {
        name: "hardhat",
        keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        fundAmount: "100000000000000000000",
        callbackGasLimit: "100000",
    },
    31337: {
        name: "locahost",
        keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        fundAmount: "100000000000000000000",
        callbackGasLimit: "100000",
    },
    11155111: {
        name: "sepolia",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        VRFCoordinatorAddress: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
        keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        fundAmount: "10",
        subscriptionId: "80346584607123641025235565757149319115335523622206522914011057713791277016777",
        callbackGasLimit: "40000",
    },
};

const developmentChains = ["hardhat", "localhost"];
module.exports = {
    networkConfig,
    developmentChains,
    VRF_COORDINATOR_ABI,
    LINK_TOKEN_ABI
};