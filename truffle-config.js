const path = require("path");
var HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    kovan: {
      provider: new HDWalletProvider(
        "abuse culture whale flight narrow panther garage sail crime snack custom you",
        "https://kovan.infura.io/v3/79bd63570a0542498f6092d601f72ae0"
      ),
      network_id: 42,
      // networkCheckTimeout: 10
      gas: 4500000,
      gasPrice: 10000000000,
    },
    // since main contarcts are using Chainlink oracles on KOVAN testnet, so we will be using the KOVAN testnet for truffle-test also to ease out the process
    // it may take few minutes for all test-cases to give a result
    test: {
      network_id: 42,
      gas: 4500000,
      gasPrice: 10000000000,
      provider: () => new HDWalletProvider('abuse culture whale flight narrow panther garage sail crime snack custom you', 'https://kovan.infura.io/v3/79bd63570a0542498f6092d601f72ae0')
    },
  },
  compilers: {
    solc: {
      version: "^0.6.0", // A version or constraint - Ex. "^0.5.0"
    }
  }
};



