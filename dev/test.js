import { Blockchain } from "./blockchain.js";

const bitcoin = new Blockchain();

bitcoin.createNewBlock(100, "HASH", "HASH");

console.log(bitcoin);