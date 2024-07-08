const {ethers, BigNumber, JsonRpcProvider, constants} = require("ethers");
const userABI = require("./UserRegistretionABI.json");
const documentABI = require("./DocumentStorage.json");
require("dotenv").config();
let connectionRequest = require('./connection');
const {Web3} = require('web3');
const bodyParser = require("body-parser");
const web3 = new Web3(process.env.PROVIDER_ADDRESS);

async function eventListner() {
    const userContractAddress = process.env.USER_REGISTRATION_CONTRACT_ADDRESS;
    const userProvider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_ADDRESS);
    const userContract = new ethers.Contract(userContractAddress, userABI.abi, userProvider);

    // EVENT FOR USER REGISTRETION
    userContract.on("UserRegistered", async (user, name, isVerified, event) =>{
        console.log("#####UserRegistered event tiggerd!!!!");

        let connection;
        try{
            connection = connectionRequest();

            const block = await web3.eth.getBlock(event.blockNumber);
            const blockNumber = block.number;
            const tx = await web3.eth.getTransaction(event.transactionHash);
    
            console.log("tx ", tx.hash);
            console.log("block number ", blockNumber);
            await updateUserRegistrationTable(connection, user, blockNumber, tx.hash);
        }catch(err){
            console.log(err);
        }finally{
            connection.destroy();
        }
    });

    const docContractAddress = process.env.DOCUMENT_STORAGE_CONTRACT_ADDRESS;
    const docProvider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_ADDRESS);
    const docContract = new ethers.Contract(docContractAddress, documentABI.abi, docProvider);
    
    // EVENT FOR DOCUMENT UPLOADED
    docContract.on("DocumentUploaded", async(documnetId, title, owner, event) => {
        console.log("#####DocumentUploaded event tiggerd!!!");

        let connection;
        try{
            connection = connectionRequest();
            const block = await web3.eth.getBlock(event.blockNumber);
            const blockNumber = block.number;
            const tx = await web3.eth.getTransaction(event.transactionHash);
            
            console.log("=================================");
            const bigNumber = BigNumber.from(documnetId);
            const docId = bigNumber.toNumber();

            console.log("tx ", tx.hash);
            console.log("documnetId  ==> ", docId);
            console.log("owner ===> ", owner);
            console.log("block number ", blockNumber);
            console.log("title ==> ", title);
            console.log("=================================");

            await updateDocumentStorageTxOwnerDocumentId(connection, docId, blockNumber, tx.hash, owner, title);
        }catch(err){
            console.log(err);
        }finally{

        }
    });
}

async function updateUserRegistrationTable(connection, user, blockNumber, tx) {
    const UPDATE_USER_REGISTRATION_BY_USER = `UPDATE USERS SET BLOCK_NUMBER = ?, TX_HASH = ? WHERE PUBLIC_ADDRESS = ?`;
    console.log(`SQL Query: ${UPDATE_USER_REGISTRATION_BY_USER}`);
    console.log(`Values: blockNumber=${blockNumber}, tx=${tx}, user=${user}`);

    return new Promise((resolve, reject) => {
        connection.query(UPDATE_USER_REGISTRATION_BY_USER, [blockNumber, tx, user], (err, rows) => {
            if (err) {
                console.error(`Error executing query: ${err.message}`);
                reject(err);
            } else {
                console.log(`Query executed successfully, affected rows: ${rows.affectedRows}`);
                resolve(rows);
            }
        });
    });
}



async function updateDocumentStorageTxOwnerDocumentId(connection, documnetId, blockNumber, tx, owner, title){

    let UPDATE_DOCUMENT_ID_TX_HASH = `UPDATE DOCUMENTS SET DOCUMENT_ID = ?, BLOCK_NUMBER = ?, TX_HASH = ?, OWNER = ? WHERE TITLE = ?`;
    console.log(`SQL Query: ${UPDATE_DOCUMENT_ID_TX_HASH}`);

    return new Promise((resolve, reject) => {
        connection.query(UPDATE_DOCUMENT_ID_TX_HASH, [documnetId, blockNumber, tx, owner, title], (err, rows) => {
            if (err) {
                console.error(`Error executing query: ${err.message}`);
                reject(err);
            } else {
                console.log(`Query executed successfully, affected rows: ${rows.affectedRows}`);
                resolve(rows);
            }
        });
    });
}

module.export = eventListner();