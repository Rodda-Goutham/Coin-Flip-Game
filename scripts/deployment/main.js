import hardhat from "hardhat";
import { deployMocks } from "../deployment/deploy-Mocks.js";
import { deployCoinFlip } from "../deployment/deploy-CoinFlip.js";
const { network, run } = hardhat;
async function main() {
    await run("compile");
    const chainId = network.config.chainId;
    if (chainId == 31337) {
        const args = await deployMocks(chainId);
        await deployCoinFlip(args);
    } else {
        await deployCoinFlip([chainId, 0, 0, 0]);
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
