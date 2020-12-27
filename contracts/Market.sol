pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;
import './PriceAPI.sol';
// import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Interface for Market Contract
/// @author Kuldeep K Srivastava
interface IMarket {
    
    enum Action {lt, gt, eq}
    enum State {active, inactive}
    
    struct MarketDetails {
        State state;
        string token1;
        string token2;
        uint amount;
        Action action;
        uint startTime;
        uint interval;
        uint endTime;
        uint totalVotes;
        uint yesVotes;
        uint noVotes;
        uint yesPrice;
        uint noPrice;
        bool result;
        uint totalBet;
    }
    
    
    struct Prediction {
        uint share;
        bool verdict;
    }
    
    event predicted(address indexed user, bool verdict, uint share);
    event resultDeclared(address indexed market, address user);
    event withdrawAmount(address indexed user, uint amount);
    
    //  @notice Get all the current details of the market
    //  @return Market struct with all the details
    function getMarket() external returns (MarketDetails memory);
    
    //  @notice Allows an end-user to make prediction for the market
    //  @param _verdict Yes/No selected by end-user
    //  @param _share Amount of share that user is purchasing for his prediction
    //  @return Returns true if successful
    function predict(bool, uint) external payable returns (bool);
    
    //  @notice Resolves the market after the market's prediction function is closed
    //  @return Returns true if successful
    function result() external returns (bool);
    
    //  @notice Allows user to withdraw their winning amount after market is resolved
    //  @return Returns true if successful
    function withdraw() external returns (bool);
    
}

/// @title Cryptocurrency Price Prediction Market
/// @dev Inherits IMarket Interface, APIConsumer Contract
/// @author Kuldeep K. Srivastava
contract Market is IMarket,ReentrancyGuard,APIConsumer {
    
    // using SafeMath for uint256;
    
    //  @notice  Address of the user who created this market
    //  @return Returns market owner's address
    address public marketOwner;

    MarketDetails private M;
    
    mapping(address => Prediction) public predictions;
    mapping(address => bool) public predictors;
    
    constructor (
        address owner,
        string memory token1,
        string memory token2,
        Action action,
        uint amount,
        uint interval
    ) public {
        marketOwner = owner;
        M.state = State.active;
        M.token1 = token1;
        M.token2 = token2;
        M.amount = amount;
        M.action = action;
        M.startTime = block.timestamp;
        M.interval = interval;
        M.endTime = M.startTime + interval;
        M.totalVotes = 0;
        M.yesVotes = 0;
        M.noVotes = 0;
        M.yesPrice = 50 wei;
        M.noPrice= 50 wei;
        M.totalBet = 0;
    }
    
    bool public stopped = false;

    modifier stopInEmergency { require(!stopped, "stopped in emergency"); _; }
    
    modifier onlyInEmergency { require(stopped, "only in emergency"); _; }
    
    modifier marketActive() {
        require(M.endTime >= block.timestamp,"Market is not accepting prediction anymore");
        _;
    }
    
    modifier marketInProgress() {
        require(M.endTime < block.timestamp,"Market is still active");
        require(M.state == State.active,"Market is already resolved");
        require(marketResolved == false);
        _;
    }
    
    modifier marketInactive() {
        require(M.endTime < block.timestamp,"Market is still active");
        require(M.state == State.inactive,"Market is not resolved yet");
        require(marketResolved == true);
        _;
    }
 
    //  @notice Get all the current details of the market
    //  @return Market struct with all the details
    function getMarket() public override returns (MarketDetails memory) {
        return M;
    }
    
    //  @notice Allows an end-user to make prediction for the market
    //  @dev It uses circuit breaker pattern.
    //  @param _verdict Yes/No selected by end-user
    //  @param _share Amount of share that user is purchasing for his prediction
    //  @return Returns true if successful
    function predict(bool _verdict, uint _share)  public override payable marketActive stopInEmergency returns (bool) {
        // market not close
        // not already predicted
        // amount is correct
        // create a new predict
        // add to predictions list
        // modify yes or no votes and profits
        // return true
        // use circuit breaker pattern
        
        require(predictors[msg.sender] == false, "You have already participated in this market");
        if(_verdict) {
            require((M.yesPrice.mul(_share)) <= msg.value, "Not enough amount");
        } else {
            require((M.noPrice.mul(_share)) <= msg.value, "Not enough amount");
        }
                
        M.totalVotes = M.totalVotes.add(1);
        
        if(_verdict) {
            M.yesVotes = M.yesVotes.add(1);
            M.yesPrice = ((M.yesVotes.mul(10**2)).div(M.totalVotes));
            M.noPrice = ((M.noVotes.mul(10**2)).div(M.totalVotes)); 
        } else {
            M.noVotes = M.noVotes.add(1);
            M.noPrice = ((M.noVotes.mul(10**2)).div(M.totalVotes));
            M.yesPrice = ((M.yesVotes.mul(10**2)).div(M.totalVotes));
        }
        
        Prediction memory p = Prediction({
            share:_share,
            verdict: _verdict
        });
        
        predictions[msg.sender] = p;
        predictors[msg.sender] = true;
        M.totalBet = M.totalBet.add(msg.value);
        emit predicted(msg.sender, _verdict, _share);
        return true;
    }
    
    //  @notice Resolves the market after the market's prediction function is closed
    //  @dev It uses chainlink oracle for doing the same.
    //  @return Returns true if successful
    function result() public override marketInProgress returns(bool) {
        // require only owner or one of the depositor
        // call API
        // get API response
        // change result value
        // change State to inactive
        require(msg.sender == marketOwner || predictors[msg.sender], "Not authorised");
        if(M.action == Action.lt) {
            requestVolumeData(M.token1, M.token2, 0 , M.amount);
        } else if(M.action == Action.gt) {
            requestVolumeData(M.token1, M.token2, 1, M.amount);
        } else {
            requestVolumeData(M.token1, M.token2, 2, M.amount);
        }
        M.state = State.inactive;
        stopped = true;
        emit resultDeclared(address(this), msg.sender);
        return true;
    }
    
    //  @notice Allows user to withdraw their winning amount after market is resolved
    //  @dev It uses withdrawl pattern
    //  @return Returns true if successful
    function withdraw() public override marketInactive nonReentrant onlyInEmergency returns(bool) {
        // withdrawl pattern
        // check user has deposited
        // calculate amount to pay
        // check if enough balance
        // change share to 0
        // tranfer eth to the user
        require(predictors[msg.sender], "Not authorised");
        require(predictions[msg.sender].share != 0, "Already withdrawn");
        Prediction memory p = predictions[msg.sender];
        require(finalWinner == p.verdict, "Sorry you lost");
        uint winningAmount;
        if(finalWinner){
            winningAmount = (M.totalBet).div(M.yesVotes);
        } else {
            winningAmount = (M.totalBet).div(M.noVotes);
        }
        predictions[msg.sender].share = 0;
        uint amountToTake = winningAmount;
        require(address(this).balance >= amountToTake, "Not enough balance");
        msg.sender.transfer(amountToTake);
        emit withdrawAmount(msg.sender, amountToTake);
        return true;
    }

    function circuitBreakerStop() public returns(bool) {
        require(msg.sender == marketOwner);
        stopped = true;
    }
    
    // upgradablility
}