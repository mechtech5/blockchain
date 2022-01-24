import { Blockchain } from "./blockchain.js";

const bitcoin = new Blockchain();

bitcoin.createNewTransaction(10, "ALEX", "JACK");
bitcoin.createNewBlock(101, "HASH", "HASH");

console.log(bitcoin);