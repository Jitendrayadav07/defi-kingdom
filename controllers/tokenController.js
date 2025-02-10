const Response = require("../classes/Response");
const db = require("../config/db.config");
const { Op, QueryTypes } = require("sequelize");
const USER_CONSTANTS = require("../constants/userConstants");
const TOKEN_CONSTANTS = require("../constants/tokenConstants");
const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
const routerAddress = TOKEN_CONSTANTS.ROUTER_ADDRESS;
const routerAbi = [
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

async function tokenToNative(amount, wallet, path, from) {
    try {
        const router = new ethers.Contract(routerAddress, routerAbi, wallet);

        const amountIn = ethers.parseEther(amount);
        const amountsOut = await router.getAmountsOut(amountIn, path);
        const jewelAmount = amountsOut[1];

        if (!jewelAmount) {
            let response = {
                status: false,
                message: "Could not fetch price. Aborting swap."
            }
            return response;
        }

        const amountOutMin = (jewelAmount * 98n) / 100n; // Apply 2% slippage tolerance
        const recipient = await wallet.getAddress();
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10-minute deadline


        // Approve token spending first
        const approveContract = new ethers.Contract(from, ["function approve(address spender, uint256 amount)"], wallet);
        const approveTx = await approveContract.approve(routerAddress, amountIn);
        await approveTx.wait();

        // Swap transaction
        const tx = await router.swapExactTokensForETH(amountIn, amountOutMin, path, recipient, deadline, {
            gasLimit: 300000,
            gasPrice: ethers.parseUnits("50", "gwei")
        });

        await tx.wait();

        let response = {
            status: true,
            message: "Swap complete!"
        }
        return response;
    } catch (error) {
        console.log("Error swapping tokens", error)
        let response = {
            status: false,
            message: "Error swapping tokens"
        }
        return response;
    }
}

async function nativeToToken(amount, wallet, path) {
    try {
        const router = new ethers.Contract(routerAddress, routerAbi, wallet);

        const amountIn = ethers.parseUnits(amount, 18);

        const recipient = await wallet.getAddress();
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 10 minutes

        const amountsOut = await router.getAmountsOut(amountIn, path);
        const estimatedAmountOut = amountsOut[amountsOut.length - 1];

        // ✅ Apply 5% slippage tolerance correctly using BigInt
        const amountOutMin = (estimatedAmountOut * 95n) / 100n;

        const tx = await router.swapExactETHForTokens(
            amountOutMin,
            path,
            recipient,
            deadline,
            {
                value: amountIn,  // Sending JEWEL as native token
                gasLimit: 300000
            }
        );

        await tx.wait();

        let response = {
            status: true,
            message: "Swap complete!"
        }

        return response;

    } catch (error) {
        console.log("Error swapping tokens", error)
        let response = {
            status: false,
            message: "Error swapping tokens"
        }
        return response;
    }

}

async function tokenToToken(amount, wallet, from, path) {
    try {

        const router = new ethers.Contract(routerAddress, routerAbi, wallet);

        // AVAX Token Contract
        const approveABI = ["function approve(address spender, uint256 amount) external returns (bool)"];
        const approveToken = new ethers.Contract(from, approveABI, wallet);

        // Amount to Swap (e.g., 1 AVAX)
        const amountIn = ethers.parseUnits(amount, 18);

        const approvetx = await approveToken.approve(routerAddress, amountIn);
        await approvetx.wait();

        const amounts = await router.getAmountsOut(amountIn, path);
        const amountOutMin = amounts[1] * 99n / 100n; // 1% slippage tolerance

        const recipient = await wallet.getAddress();
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            recipient,
            deadline,
            { gasLimit: 300000 }
        );

        await tx.wait();

        let response = {
            status: true,
            message: "Swap complete!"
        }

        return response;

    } catch (error) {
        console.log("Error swapping tokens", error)
        let response = {
            status: false,
            message: "Error swapping tokens"
        }
        return response;
    }
}

const swapTokens = async (req, res) => {
    try {

        let { amount, from, to } = req.body;

        let user = await db.users.findOne({
            where: {
                email: req.user.email
            }
        });

        let privateKey = user.wallet_private_key;

        const wallet = new ethers.Wallet(privateKey, provider);
        let swap_data = {}

        // Token Addresses
        const AVAX = TOKEN_CONSTANTS.AVAX;
        const CRYSTAL = TOKEN_CONSTANTS.CRYSTAL;
        const USDC = TOKEN_CONSTANTS.USDC;
        const HONK = TOKEN_CONSTANTS.HONK;
        const JEWEL = TOKEN_CONSTANTS.JEWEL;

        let path = [];

        switch (true) {
            case from.toLowerCase() === "avax" && to.toLowerCase() === "jewel":
                // Your code here for AVAX to JEWEL
                path = [AVAX, JEWEL];
                swap_data = await tokenToNative(amount, wallet, path, AVAX);

                if (swap_data.status) {
                    return res.status(200).send(Response.sendResponse(true, null, swap_data.message, 200));
                } else {
                    return res.status(400).send(Response.sendResponse(false, null, swap_data.message, 400));
                }

                break;

            case from.toLowerCase() === "jewel" && to.toLowerCase() === "avax":
                // Your code here for JEWEL to AVAX

                // Swap path
                path = [JEWEL, USDC, HONK, AVAX]; // JEWEL -> USDC -> HONK -> AVAX

                swap_data = await nativeToToken(amount, wallet, path);

                if (swap_data.status) {
                    return res.status(200).send(Response.sendResponse(true, null, swap_data.message, 200));
                } else {
                    return res.status(400).send(Response.sendResponse(false, null, swap_data.message, 400));
                }
                break;

            case from.toLowerCase() === "avax" && to.toLowerCase() === "crystal":

                // Swap path
                path = [AVAX, CRYSTAL];

                // Your code here for avax to crystal
                swap_data = await tokenToToken(amount, wallet, AVAX, path);

                if (swap_data.status) {
                    return res.status(200).send(Response.sendResponse(true, null, swap_data.message, 200));
                } else {
                    return res.status(400).send(Response.sendResponse(false, null, swap_data.message, 400));
                }
                break;

            case from.toLowerCase() === "crystal" && to.toLowerCase() === "avax":

                // Swap path
                path = [CRYSTAL, AVAX];

                // Your code here for avax to crystal
                swap_data = await tokenToToken(amount, wallet, CRYSTAL, path);

                if (swap_data.status) {
                    return res.status(200).send(Response.sendResponse(true, null, swap_data.message, 200));
                } else {
                    return res.status(400).send(Response.sendResponse(false, null, swap_data.message, 400));
                }
                break;

            case from.toLowerCase() === "jewel" && to.toLowerCase() === "crystal":
                // Your code here for JEWEL to CRYSTAL

                // Swap path
                path = [JEWEL, CRYSTAL]; // JEWEL -> CRYSTAL

                swap_data = await nativeToToken(amount, wallet, path);

                if (swap_data.status) {
                    return res.status(200).send(Response.sendResponse(true, null, swap_data.message, 200));
                } else {
                    return res.status(400).send(Response.sendResponse(false, null, swap_data.message, 400));
                }
                break;

            case from.toLowerCase() === "crystal" && to.toLowerCase() === "jewel":
                // Your code here for CRYSTAL to JEWEL

                path = [CRYSTAL, JEWEL];

                swap_data = await tokenToNative(amount, wallet, path, CRYSTAL);

                if (swap_data.status) {
                    return res.status(200).send(Response.sendResponse(true, null, swap_data.message, 200));
                } else {
                    return res.status(400).send(Response.sendResponse(false, null, swap_data.message, 400));
                }

                break;

            default:
                return res.status(400).send(Response.sendResponse(false, null, "Invalid from and to token", 400));
        }
    } catch (error) {
        console.log("errr", error)
        return res.status(500).send(Response.sendResponse(false, null, error, 500));
    }
}

const withdrawFunds = async (req, res) => {
    try {
        let user_data = await db.users.findOne({ where: { email: req.user.email } });

        if (!user_data) {
            return res.status(404).send(Response.sendResponse(false, null, USER_CONSTANTS.USER_NOT_FOUND, 404));
        }

        // Connect to Avalanche C-Chain
        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.AVAX_RPC_URL);
        const wallet = new ethers.Wallet(user_data.wallet_private_key, provider);

        // Define the transaction
        const tx = await wallet.sendTransaction({
            to: req.body.to,
            value: ethers.parseEther(String(req.body.amount)),
        });

        console.log("Transaction sent! Hash:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        res.status(200).send(Response.sendResponse(true, null, "Transaction confirmed in block: " + receipt.blockNumber, 200));

    } catch (error) {
        console.log("errr", error)
        return res.status(500).send(Response.sendResponse(false, null, error, 500));
    }
}

module.exports = {
    swapTokens,
    withdrawFunds,
    withdrawFunds
}
