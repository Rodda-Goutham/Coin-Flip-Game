import hardhat from "hardhat";
const { run } = hardhat;

export async function verify(contractAddress, args) {
    console.log("verifying contract....");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    }
    catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("already verified");
        }
        else {
            console.log(e);
        }
    }

}