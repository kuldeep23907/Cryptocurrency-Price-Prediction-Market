pragma solidity >=0.6.0;
import './Market.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
        IERC20(address(0xa36085F69e2889c224210F603D836748e7dC0088)).transfer(newMarket, 10**17);
        emit marketCreated(newMarket, block.timestamp + interval);
        return newMarket;
    }
    
    //  @notice Get all markets addressess
    //  @return All the markets addressess
    function getAllMarkets() public view returns(address[] memory) {
        return markets;
    }
    
     /**
     * Withdraw LINK from this contract
     * 
     * NOTE: DO NOT USE THIS IN PRODUCTION AS IT CAN BE CALLED BY ANY ADDRESS.
     * THIS IS PURELY FOR EXAMPLE PURPOSES ONLY.
     */
    function withdrawLink() external {
        IERC20 c =  IERC20(address(0xa36085F69e2889c224210F603D836748e7dC0088));
        c.transfer(msg.sender, c.balanceOf(address(this)));
    }
}