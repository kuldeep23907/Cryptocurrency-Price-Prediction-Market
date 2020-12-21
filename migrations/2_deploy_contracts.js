var PricePredictionMarketFactory = artifacts.require("./PricePredictionMarketFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(PricePredictionMarketFactory);
};
