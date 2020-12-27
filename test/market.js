const Market = artifacts.require("./Market.sol");
const ERC20 = require("../client/src/contracts/IERC20.json");

contract("Market", accounts => {

  const marketOwner = accounts[0];
  const token1 = 'ETH';
  const token2 = 'USD';
  const action = 0;
  const amount = 500;
  const interval = 90;
  const ERC20LINK = new web3.eth.Contract(
    ERC20.abi,
    "0xa36085F69e2889c224210F603D836748e7dC0088"
  );
  let marketInstance;

  beforeEach( async () => {
    marketInstance = await Market.new(marketOwner,token1, token2, action, amount, interval);
  });

  // Setting up market and checking if msg.sender is being setup as market owner or not
  contract('setupMarket' , async() => {
    it("...should create a market with correct details", async () => {
      // Get markets data
      const mOwner = await marketInstance.marketOwner.call();
      const marketDetails = await marketInstance.getMarket.call(); 
      // asserting
      assert.equal(mOwner, marketOwner, "Market Owner is not set correctly");
      assert.equal(parseInt(marketDetails.state), 0, 'Newly created market is not in active state');
      assert.equal((parseInt(marketDetails.endTime) - parseInt(marketDetails.startTime)), interval, 'End time of market is not set properly');
      assert.equal(parseInt(marketDetails.totalVotes) + parseInt(marketDetails.yesVotes) + parseInt(marketDetails.noVotes), 0, 'Newly creatd market does not have either yesVotes or noVotes or total votes equal to 0');
      assert.equal(parseInt(marketDetails.yesPrice), 50, 'Initial price of Yes Vote shud be 50 wei');
      assert.equal(parseInt(marketDetails.noPrice), 50, 'Initial price of No Vote shud be 50 wei');
      assert.equal(parseInt(marketDetails.totalBet), 0, 'Initial total bet shud be 0');

    });
  });

  // Testing if a prediction done by user is stored properly and id updatind the state value correctly
  contract('prediction' , async() => {
    it("...should register a prediction by any user correctly", async () => {
      // Market is  "Will ETH price will be less than 500 USD after 5 minutes?"
      // Account 0 will predict Yes for it and pay 0.05 ether for the same
      await marketInstance.predict(true, '1000000000000000', {from:accounts[0], value:'50000000000000000'});
      // Get markets data
      const isUserPredictionRegistered = await marketInstance.predictors.call(accounts[0]); 
      const predictionRegistered = await marketInstance.predictions.call(accounts[0]);
      // asserting
      assert.equal(isUserPredictionRegistered, true, "User prediction action failed");
      assert.equal(predictionRegistered.verdict, true, "Stored prediction data is not stored");
    });
  });

  contract('priceUpdate' , async() => {
    it("...should update the yesPrice and noPrice after every prediction", async () => {
      // Market is  "Will ETH price will be less than 500 USD after 5 minutes?"
      // Account 0 will predict Yes for it and pay 0.05 ether for the same 
      // and after predicting the yesPrice will be 100 wei and noPrice will be 0
      await marketInstance.predict(true, '1000000000000000', {from:accounts[0], value:'50000000000000000'});
      // Get markets data
      const marketDetails = await marketInstance.getMarket.call(); 
      // asserting
      assert.equal(marketDetails.yesPrice, 100, "YesPrice not updated properly");
      assert.equal(marketDetails.noPrice, 0, "NoPrice not updated properly");
    });
  });

  // Testing if market is getting closed or not after end time
  contract('market status' , async() => {
    it("...should not allow any user to predict after endTime", async () => {
      // Market is  "Will ETH price will be less than 500 USD after 5 minutes?"
      // User will try to precict after the endtime that is after 90 seconds and it should throw error
      let failed = false;
      try {
        await new Promise(r => setTimeout(r, 100000));
        await marketInstance.predict(true, '1000000000000000', {from:accounts[0], value:'50000000000000000'});
      } catch(e) {
        failed = true;
      }
      assert.equal(failed, true, "User was able to predict even after end time of market");
    });
  });

  // Testing if market is resolved properly or not
  contract('result' , async() => {
    it("...should resolve the market using Chainlink Oracle and update the resolvedAmount", async () => {
      // fund this market with 0.1 tokens as this will use Chainlink Oracle  
      await ERC20LINK.methods.transfer(marketInstance.address,'100000000000000000').send({from:accounts[0]});
      // Market is  "Will ETH price will be less than 500 USD after 5 minutes?"
      // Account 0 will predict Yes for it and pay 0.05 ether for the same 
      // and after predicting the yesPrice will be 100 wei and noPrice will be 0
      await new Promise(r => setTimeout(r, 100000));
      await marketInstance.result({from:accounts[0]});
      await new Promise(r => setTimeout(r, 20000));
      // Get markets data
      const marketDetails = await  marketInstance.getMarket.call();
      const resolvedAmount = await marketInstance.resultAmount.call();
      const marketResolved = await marketInstance.marketResolved.call();
      const finalWinner = await  marketInstance.finalWinner.call();
      console.log(resolvedAmount, marketResolved, finalWinner);
      // asserting
      assert.equal(parseInt(marketDetails.state), 1, "Market status failed to be set as Inactive");
      assert.equal(marketResolved, true, "Market is not resolved yet");
      assert.equal(resolvedAmount > 0,  true, "Market is not resolved properly");
      assert.equal(resolvedAmount < amount*(10**18), finalWinner, "Market is not resolved correctly");
    });
  });

});
