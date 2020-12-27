const PricePredictionMarketFactory = artifacts.require("./PricePredictionMarketFactory.sol");
const ERC20 = require("../client/src/contracts/IERC20.json");
const Market = require("../client/src/contracts/Market.json");
contract("PricePredictionMarketFactory", accounts => {

  const token1 = 'ETH';
  const token2 = 'USD';
  const action = 0;
  const amount = 500;
  const interval = 300;
  const ERC20LINK = new web3.eth.Contract(
    ERC20.abi,
    "0xa36085F69e2889c224210F603D836748e7dC0088"
  );
  let marketFactoryInstance;

  beforeEach( async () => {
    marketFactoryInstance = await PricePredictionMarketFactory.deployed();
  });


  // Trying to check if the market factory can create multiple markets
  contract('multipleMarkets' , async() => {
    it("...should create multiple markets", async () => {
      // Targetting 2 markets so Factory Contract will require 0.2 LINK  - 0.1 per market
      await ERC20LINK.methods.transfer(marketFactoryInstance.address,'200000000000000000').send({from:accounts[0]});
      // Create a new market for "Will ETH price will be less than 500 USD after 5 minutes?"
      await marketFactoryInstance.createMarket(token1,token2, action, amount, interval, { from: accounts[0] });
      await marketFactoryInstance.createMarket(token1,token2, action, amount, interval, { from: accounts[0] });
      // Get markets data
      const markets = await marketFactoryInstance.getAllMarkets.call();  
      assert.equal(markets.length, 2, "Multiple markets are not getting created successfully");
    });
  })

  // Testing if market si getting created using correct details such as input by user or initialised values
  contract("createMarket", async () => {
    
    // Checking for User Inputs
    it("...should create a market with correct details", async () => {
      await ERC20LINK.methods.transfer(marketFactoryInstance.address,'100000000000000000').send({from:accounts[0]});
      // Create a new market for "Will ETH price will be less than 500 USD after 5 minutes?"
      await marketFactoryInstance.createMarket(token1,token2, action, amount, interval, { from: accounts[0] });
      // Get market data
      const markets = await marketFactoryInstance.getAllMarkets.call();
      assert.equal(markets.length, 1, "Market is not created successfully");
  
      const newMarket = new  web3.eth.Contract(Market.abi, markets[0]);
      const marketDetails = await newMarket.methods.getMarket().call();
      // console.log(marketDetails);
  
      assert.equal(marketDetails.token1, token1, 'Token is not set properly');
      assert.equal(parseInt(marketDetails.action), action, 'Action is not set properly');
      assert.equal(parseInt(marketDetails.amount), amount, 'Amount is not set properly');
      assert.equal(parseInt(marketDetails.interval), interval, 'Interval is not set properly');
  
    });

    // Checking for Initialised values such as votes counts, prices etc.
    it("...should initialise market correctly", async () => {
      await ERC20LINK.methods.transfer(marketFactoryInstance.address,'100000000000000000').send({from:accounts[0]});
      // Create a new market for "Will ETH price will be less than 500 USD after 5 minutes?"
      await marketFactoryInstance.createMarket(token1,token2, action, amount, interval, { from: accounts[0] });
      // Get market data
      const markets = await marketFactoryInstance.getAllMarkets.call();  
      const newMarket = new  web3.eth.Contract(Market.abi, markets[0]);
      const marketDetails = await newMarket.methods.getMarket().call();
      
      assert.equal(parseInt(marketDetails.state), 0, 'Newly created market is not in active state');
      assert.equal((parseInt(marketDetails.endTime) - parseInt(marketDetails.startTime)), interval, 'End time of market is not set properly');
      assert.equal(parseInt(marketDetails.totalVotes) + parseInt(marketDetails.yesVotes) + parseInt(marketDetails.noVotes), 0, 'Newly creatd market does not have either yesVotes or noVotes or total votes equal to 0');
      assert.equal(parseInt(marketDetails.yesPrice), 50, 'Initial price of Yes Vote shud be 50 wei');
      assert.equal(parseInt(marketDetails.noPrice), 50, 'Initial price of No Vote shud be 50 wei');
      assert.equal(parseInt(marketDetails.totalBet), 0, 'Initial total bet shud be 0');

    });
  });

});
