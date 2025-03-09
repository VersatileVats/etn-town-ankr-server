import Web3, { errors } from "web3";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 7580;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const web3 = new Web3(process.env.ankrAPIEndpoint);

const admin = "0xe50058eaFB009bfa754e1020CD133E42db0fbc6c";
const adminPrivateKey = process.env.adminPrivateKey;

// default endpoint
app.get("/", async (req, res) => {
  res.send({
    result:
      "ETN server for handling the rqeuests & will win the event for sure",
  });
});

async function sendTransaction(amount, receiver, memo = "") {
  try {
    // Fetch latest gas price
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = await web3.eth.estimateGas({
      from: admin,
      to: receiver,
      value: web3.utils.toWei(amount, "ether"),
      data: web3.utils.toHex(memo), // Include memo in estimation
    });

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        from: admin,
        to: receiver,
        value: web3.utils.toWei(amount, "ether"),
        gas: gasLimit, // Dynamic gas limit
        gasPrice: gasPrice, // Dynamic gas price
        data: web3.utils.toHex(memo), // Convert memo to hex
      },
      adminPrivateKey
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log(receipt.transactionHash);
    return {
      error: null,
      data: receipt.transactionHash,
    };
  } catch (error) {
    let errorReason = error.errors ? error.errors[0]?.message : error.reason;

    if (errorReason.includes("insufficient funds"))
      errorReason = "Insufficient funds in the sender wallet";
    else if (errorReason.includes('must pass "bytes" validation'))
      errorReason = "Invalid private key provided";

    return {
      error: errorReason,
      data: null,
    };
  }
}

app.post("/sendETN", async (req, res) => {
  const { amount, receiver, memo } = req.body;

  if (!amount || !receiver)
    return res.send({
      success: false,
      error: "Provide all required values",
    });

  // const sendRes = await sendTransaction(amount, receiver);
  const sendRes = await sendTransaction(amount, receiver, memo);

  res.send({
    success: sendRes?.error ? false : sendRes.data,
    error: sendRes?.error ? sendRes.error : null,
  });
});
