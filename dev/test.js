import { Blockchain } from "./blockchain.js";

const bitcoin = new Blockchain();

const previousBlockHash = "aeaa";
const currentBlockData = [
    {
        amount: 100,
        sender: "a",
        recipient: "b",
    },
    {
        amount: 100,
        sender: "b",
        recipient: "a",
    },
    {
        amount: 100,
        sender: "a",
        recipient: "b",
    },
]

console.log(bitcoin.proofOfWork(previousBlockHash, currentBlockData));