pragma solidity >=0.6.0;
import './Market.sol';

/// @title Cryptocurrency Price Prediction Market factory Contract
/// @notice Factory that allows end-users to create new markets
/// @dev Imports Market Contarct and create new market using it
/// @author Kuldeep K. Srivastava
contract PricePredictionMarketFactory {
    
    //  @notice List of all market's contracts addressess
    //  @return Returns all market's addressess
    address[] public markets;
    event marketCreated(address indexed, uint endTime);
    
    //  @notice Allows an end-user to create a new market for any particular Cryptocurrency
    //  @dev Uses Market Smart Contract
    //  @param token1 Token1 for which market will be created
    //  @param token2 Token2 for which market will be created if there is comparison b/w 2 tokens price
    //  @param action Action which this end-user wants such as less than, greater than or equal to
    //  @param amount Amount in USD which will be set by end-user to perform the action eg. Token1 less than 200 USD
    //  @param interval Time period after which the market will be resolved eg. Token will be more than 300 after 2 days from now
    //  @return Return address of the newly generated Market Contarct
    function createMarket(string memory token1, string memory token2, IMarket.Action action, uint amount, uint interval) public returns(address) {
        address newMarket = address(new Market(msg.sender, token1, token2, action, amount, interval));
        markets.push(newMarket);
        emit marketCreated(newMarket, Market(newMarket).M.endTime);
        return newMarket;
    }
    
    //  @notice Get all markets addressess
    //  @return All the markets addressess
    function getAllMarkets() public view returns(address[] memory) {
        return markets;
    }
}