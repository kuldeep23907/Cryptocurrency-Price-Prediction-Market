# :bank: Crypto-Price-Prediction-Market
A decentralised prediction market for cryptocurrency price where end-users can predict for outcomes and earn profits. The market's are resolved using Oracle to avoid any centralised party for market resolution.

**Demo Video: https://youtu.be/i65JukIePHY**

**Deployed on IPFS: https://rapid-darkness-1064.on.fleek.co/**

IPFS Hash: QmWYdsSJ6zSh6AFvFJQvAJBBhcHW5YrJQEfLWkMa91Wrh8


## :rocket: Features
1. Users can create a market by selecting the crypto-currency symbol(ETH, BTC, USDC, DAI etc. ), amount in USD, action (less than, more than, equal to) and time interval in seconds.
2. Users can predict as yes or no for all the existing projects for which participation is still active.
3. Once prediction phase is over (currenTime > endTime of market), any of the user who either created or participated in the market can resolve the market by clicking on the resolve button.
4. Once market is resolved, all the users who have predicted and are correct, can withdraw their fair share from the market immediately.

## :construction: Development Stack

1. Ethereum && Solidity >=0.6.0
2. Truffle Framework
3. Chainlink Oracle
4. Remix IDE
5. React framework
6. Mocha Testing

## :beginner: Directory structure

**client** - react code for UI & integration using web3.js

**contract** - all smart contracts in solidity

**migrations** - Migrations file to be used by Truffle to deplot the contract on KOVAN Testnet

**test** - Unit Testing done in Mocha for the smart contracts

![final-project-consenSys](https://user-images.githubusercontent.com/24249646/102808156-e98f8180-43e5-11eb-89d1-3c08cb673f5e.png)


## :car: How to run locally

A. Clone this repository in your local system using `git clone git@github.com:kuldeep23907/Cryptocurrency-Price-Prediction-Market.git`

B. Then go to the cloned folder `cd Cryptocurrency-Price-Prediction-Market`

Now there are 2 parts of the dapp, smart contract deployment on testnet and running client locally to interact with the smart contract deployed.

if you are plannig to use already deployed smart contract with localhost:3000, please go to step D. You do not need to fund market factory with LINK tokens then.

C. **Smart Contracts**

As this truffle project, we need to do the following for deployment of smart contracts on KOVAN Testnet.

1. Run `npm install`
2. Run `truffle compile --all`
3. Run `truffle migrate --network=kovan --reset` (it will deploy a new market factory completely)
4. That's all. Market Factory Contract has been deployed on KOVAN testnet.

D. **Running Client App**

1. Go to the client folder now `cd client`
2. Run `npm install`
3. Run `npm start`
4. Now the client will be running locally at `http://localhost:3000`

## :factory: How to use the dapp

When we deploy smart contracts and run the client app to interact with it, we won't see any market. We need to create new markets and then users can participate in those markets to earn profits. 

**Before that, as we are using Chainlink Oracle to resolve our market, we need to have LINK tokens to do the same. So, once you have deployed the smart contract and client app is running, you can see the Market Factory address at the header. Send 1 or 2 LINKs to that address to proceed forward. In case you do not have LINKs tokens for KOVAN testnet, please visit here https://docs.chain.link/docs/link-token-contracts#kovan . Get some tokens from the faucet and add this custom token in your metamask wallet 0xa36085F69e2889c224210F603D836748e7dC0088. Remember it's 0.1 LINK per market which will be created.**

Once the market factory contract is funded with LINK tokens, please follow this demo link https://youtu.be/i65JukIePHY or https://github.com/kuldeep23907/Cryptocurrency-Price-Prediction-Market/blob/main/use_the_dapp.md to know about how to use the dapp.

## :hammer: How to test the smart contracts

As the main smart contracts uses Chainlink Oracles for resolving the markets, so `truffle test` will by default use the `test` network defined in the config file to run the test. Please follow the same.

