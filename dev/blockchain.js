import sha256 from "sha256";

export class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
  }

  createNewBlock(nonce, previousBlockHash, hash) {
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce: nonce,
      hash: hash,
      previousBlockHash: previousBlockHash,
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      amount: amount,
      sender: sender,
      recipient: recipient,
    };

    this.pendingTransactions.push(newTransaction);

		const lastBlock = this.getLastBlock();
    if (lastBlock) {
      return lastBlock.index + 1;
    }
    return null;
  }

  hashBlock(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + JSON.stringify(currentBlockData) + nonce.toString();
    const hash = sha256(dataAsString);
    return hash;
  }
}
