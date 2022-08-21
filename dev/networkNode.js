import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { Blockchain } from "./blockchain.js";
import rp from "request-promise";

const nodeAddress = uuidv4().split("-").join("");
const PORT = process.argv[2] || 3001;
const bc = new Blockchain();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res) => {
    return res.send(bc);
});

// Create a new transaction
app.post("/transaction", (req, res) => {
    const { newTransaction } = req.body;
    const blockIndex = this.addToPendingTransactions(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post('/transaction/broadcast', (req, res) => {
    const { amount, sender, recipient } = req.body;
    const newTransaction = bc.createNewTransaction(amount, sender, recipient);
    bc.addToPendingTransactions(newTransaction);
    const requestPromises = [];
    bc.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + "/transaction",
            method: "POST",
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            return res.send('Transaction created and broadcasted successfully');
        })


// To add a new block to the blockchain
app.post("/mine", (req, res) => {
    const lastBlock = bc.getLastBlock();
    const previousBlockHash = lastBlock["hash"];
    const currentBlockData = {
        transactions: bc.pendingTransactions,
        index: lastBlock["index"] + 1,
    };
    const nonce = bc.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bc.hashBlock(previousBlockHash, currentBlockData, nonce);
    
    bc.createNewTransaction(12.5, "00", nodeAddress);
    
    const newBlock = bc.createNewBlock(nonce, previousBlockHash, blockHash);

    bc.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + "/receive-new-block",
            method: "POST",
            body: { newBlock: newBlock },
            json: true
        };
        rp(requestOptions);
    });

    Promise.all(requestPromises)
        .then(data => {
            const requestOptions = {
                uri: bc.currentNodeUrl + "/transaction/broadcast",
                method: "POST",
                body: {
                    amount: 12.5,
                    sender: "00",
                    recipient: nodeAddress
                },
                json: true
            };
            
            return rp(requestOptions);
        })
        .then(data => {
            return res.json({
                note: "New block mined & broadcast successfully",
                block: newBlock
            });
        });
});

app.post("/receive-new-block", (req, res) => {
    const { newBlock } = req.body;
    const lastBlock = bc.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

    if (correctHash && correctIndex) {
        bc.chain.push(newBlock);
        bc.pendingTransactions = [];
        return res.json({
            note: "New block received and accepted.",
            newBlock: newBlock
        });
    } else {
        res.json({
            note: "New block rejected.",
            newBlock: newBlock
        });
    }
});

// register a node and broadcast it to the network
app.post("/node/register-and-broadcast", (req, res) => {
    const { newNodeUrl } = req.body;
    if (bc.networkNodes.indexOf(newNodeUrl) !== -1) {
        bc.networkNodes.push(newNodeUrl);
    }
    
    const regNodesPromises = [];
    bc.networkNodes.forEach((node) => {
        const requestOptions = {
            uri: node + "/node/register",
            method: "POST",
            body: { newNodeUrl },
            json: true,
        };
        
        regNodesPromises.push(rp(requestOptions));
    });
    
    Promise.all(regNodesPromises)
        .then((data) => {
            const bulkRegisterOptions = {
                uri: newNodeUrl + "/node/register-bulk",
                method: "POST",
                body: { allNetworkNodes: [...bc.networkNodes, bc.currentNodeURL] },
                json: true,
            };
            
            return rp(bulkRegisterOptions);
        })
        .then((data) => {
            return res.json({ note: "New node registered with network successfully." });
        });
});

app.post("/node/register", (req, res) => {
    const { newNodeUrl } = req.body;
    if (bc.networkNodes.indexOf(newNodeUrl) === -1) {
        bc.networkNodes.push(newNodeUrl);
    }
    return res.json({ note: "New node registered successfully." });
});

app.post("/node/register-bulk", (req, res) => {
    const { allNetworkNodes } = req.body;
    allNetworkNodes.forEach((nodeUrl) => {
        if (bc.networkNodes.indexOf(nodeUrl) === -1) {
            bc.networkNodes.push(nodeUrl);
        }
    });
    return res.json({ note: "Bulk registration successful." });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
