import React, { useState, useEffect } from "react";
import PricePredictionMarketFactoryContract from "./contracts/PricePredictionMarketFactory.json";
import MarketContract from "./contracts/Market.json";
import IERC20Contract from "./contracts/IERC20.json";
import getWeb3 from "./getWeb3";
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import "./App.css";
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import moment from 'moment';

const App = () => {

  const [web3, setWeb3] =  useState(null);
  const [accounts, setAccounts] =  useState([]);
  const [contract, setContract] =  useState(null);
  const [marketFactory, setMarketFactory] = useState(null);
  const [openMarket, setOpenMarket] = useState(false);
  const [newMarket, setNewMarket] = useState({
    'token':null,
    'action':0,
    'amount':0,
    'interval':0
  });
  const [allMarkets, setAllMarkets] = useState([]);
  const [allMarketsContract, setAllMarketsContract] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(true);

  const [openParticipate, setParticipateDialog] = useState(false);
  const [predict, setPredict] = useState({verdict:null, share:0});
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [totalAmountToPay, setTotalAmountToPay] = useState(0);
  const [linkBal, setlinkBal] = useState(0);

  const handleClickOpen = () => {
    setOpenMarket(true);
  };

  const handleClose = () => {
    setOpenMarket(false);
  };

  useEffect(() => {
    setup();
  }, []);


  const setup = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = PricePredictionMarketFactoryContract.networks[networkId];
        const instance = new web3.eth.Contract(
          PricePredictionMarketFactoryContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setMarketFactory(deployedNetwork.address);

        const ecr20Link = new web3.eth.Contract(
          IERC20Contract.abi,
          "0xa36085F69e2889c224210F603D836748e7dC0088"
        );
        
        setlinkBal(await ecr20Link.methods.balanceOf(deployedNetwork.address).call());
        setWeb3(web3);
        setContract(instance);
        setAccounts(accounts);
        const allMarkets = await instance.methods.getAllMarkets().call();
        console.log(allMarkets, "all markets");
        setAllMarkets([...allMarkets]);
  
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.

        window.ethereum.on("accountsChanged", async ([selectedAccount]) => {
          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);
        });
        
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    };

    function Copyright() {
      return (
        <Typography variant="body2" color="textSecondary" align="center">
          {'Copyright © '}
          <Link color="inherit" >
            ENS name here
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      );
    }

    useEffect(() => {
      getAllMarketsDetails();
    }, [allMarkets])

    useEffect(() => {
        console.log(allMarketsContract, "all contarcts");
    }, [allMarketsContract])

    const getAllMarketsDetails = async() => {
      console.log(allMarkets, "all markets");
      let markets = [];

      await Promise.all(
        await allMarkets.map( async (market) => {
          console.log(market, "market instance");
          const instance = new web3.eth.Contract(
            MarketContract.abi,
            market
          );
          console.log(await instance.methods.marketOwner().call(), "market owner");
          let marketDeatils = await instance.methods.getMarket().call();
          let resolvedAmount = await instance.methods.resultAmount().call();
          let marketBalance = await web3.eth.getBalance(market);
          console.log(marketDeatils, "market det");
          markets.push({details:marketDeatils, contract:instance, resolvedAmount:resolvedAmount, balance:marketBalance});
          // setAllMarketsContract([...allMarketsContract, {details:marketDeatils, contract:instance}]);
        })
      );
     
     markets = markets.sort(function(a, b) {
        var keyA = parseInt(a.details.endTime);
        var keyB = parseInt(b.details.endTime);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });
      console.log(markets, "please come");
      setAllMarketsContract([...markets]);
      setCardLoading(false);
    }

    const useStyles = makeStyles((theme) => ({
      icon: {
        marginRight: theme.spacing(2),
      },
      heroContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 0, 6),
      },
      heroButtons: {
        marginTop: theme.spacing(4),
      },
      cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
      },
      card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      cardMedia: {
        paddingTop: '56.25%', // 16:9
      },
      cardContent: {
        flexGrow: 1,
      },
      footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
      },
    }));

    const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const createMarket =  async() => {
        setLoading(true);
        console.log(newMarket, "new market");

        try {
          const marketAddress = await contract.methods.createMarket(newMarket.token,'USD', newMarket.action, newMarket.amount, newMarket.interval).send({from:accounts[0]});
          console.log(marketAddress, "new market address");
          const allmarkets = await contract.methods.getAllMarkets().call();
          console.log(allmarkets, "new market plus");
          setAllMarkets([...allmarkets]);
          setNewMarket({'token':null,
            'action':0,
            'amount':0,
            'interval':0});
          setLoading(false);
          setOpenMarket(false);
        } catch(error) {
          console.log(error);
          setLoading(false);
        }
        // getAllMarketsDetails();
    }

    const makePrediction = async() => {
      setLoading(true);
      console.log(predict, "predict values");
      let price = 0;
      if(predict.verdict === 'yes') {
        price = allMarketsContract[selectedMarket].details.yesPrice * (10**15);
      } else {
        price = allMarketsContract[selectedMarket].details.noPrice * (10**15);
      }
      const predictionRes = await allMarketsContract[selectedMarket].contract.methods.predict(predict.verdict === 'yes' ? true : false, 10**15).send({from:accounts[0], value:price});
      console.log(predictionRes, "predict result");
      setPredict({verdict:null,share:0 });
      setSelectedMarket(null);
      setParticipateDialog(false);
      setLoading(false);
      getAllMarketsDetails();
    }

    const finalResult = async(index) => {
      const res = await allMarketsContract[index].contract.methods.result().send({from:accounts[0]});
      console.log(res, "result");
      setSelectedMarket(null);
      setTimeout(getAllMarketsDetails(), 5000);
    }


    const withdraw = async(index) => {
      const res = await allMarketsContract[index].contract.methods.withdraw().send({from:accounts[0]});
      console.log(res, "withdraw");
      setSelectedMarket(null);
      getAllMarketsDetails();
    }

    function Album() {
      const classes = useStyles();

      return (
        <React.Fragment>
          <CssBaseline />
          <AppBar position="relative">
            <Toolbar>
              <AccountBalanceWalletIcon className={classes.icon} />
              <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
              <span>
                Address: {accounts[0]}
              </span>

              <span>
                Market Factory: <span style={{fontSize:'15px'}}>{marketFactory}</span>
              </span>

              <span>
                Available markets: <span style={{fontSize:'15px'}}>{linkBal/10**17}</span>
              </span>

              </div>
             
            </Toolbar>
          </AppBar>
          <main>
            {/* Hero unit */}
            <div className={classes.heroContent}>
              <Container maxWidth="sm">
                <Typography component="h2" variant="h3" align="center" color="textPrimary" gutterBottom>
                Crypto Price Prediction Market
                </Typography>
                <Typography variant="h5" align="center" color="textSecondary" paragraph>
                  This is a demo for cryptocurrency price prediction where user can create their own market 
                  and participate in active ones to earn profits. All markets are resolved using Chainlink oracle so it is completely decentralised. 
                </Typography>
                <div className={classes.heroButtons}>
                  <Grid container justify="center">
                    <Grid item>
                      <Button variant="contained" color="primary" onClick={handleClickOpen}>
                        Create a new market
                      </Button>
                    </Grid>
                  </Grid>
                </div>
              </Container>
            </div>
            <Container className={classes.cardGrid} maxWidth="md">
              {/* End hero unit */}
              <Grid container spacing={4}>
                {
                  cardLoading ? <CircularProgress/> :
                  <>
                  {allMarketsContract.map((market, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4}>
                    <Card className={classes.card}>
                      <CardMedia
                        className={classes.cardMedia}
                        title="Image title"
                        image={index%2 === 0 ? 'https://hipradar.net/wp-content/uploads/2020/05/Bitcoin-Halving.jpg' : 'https://images.cointelegraph.com/images/740_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS9zdG9yYWdlL3VwbG9hZHMvdmlldy8wNmY3YTk1MDNiOWZiODg1ZGNlMjQ5ZDU3ZjA4OWIwMy5qcGc=.jpg'}
                      />
                      <CardContent className={classes.cardContent}>
                        <Typography >
                        Market address: {market.contract.options.address}
                        </Typography>
                         <Typography style={{color: market.details.state === '0' ? 'green' : 'red'}} >
                        Market Status: {market.details.state === '0' ? 'Active' : 'Inactive'}
                        </Typography>
                          <Typography >
                        Resolved Price: {market.resolvedAmount/10**18} USD
                        </Typography>
                         <Typography >
                        Total Bet Amount: {market.details.totalBet/10**18} ETH
                        </Typography>
                        <hr/>
                        <Typography >
                          Time Start: {moment.unix(market.details.startTime).format('dddd, MMMM Do, YYYY h:mm:ss A')}
                          <br/>
                          Time End: {moment.unix(market.details.endTime).format('dddd, MMMM Do, YYYY h:mm:ss A')}
                        </Typography>
                        <hr/>
                        <Typography>
                        {
                          (market.details.action === '0') ? 
                          
                          <span> {market.details.token1} will be less than {market.details.amount} USD ?</span> :

                          (market.details.action === '1') ? 

                          <span> {market.details.token1} will be more than {market.details.amount} USD ?</span> :

                          <span> {market.details.token1} will be equal to {market.details.amount} USD ?</span>
                        }
                        </Typography>
                        <hr/>
                         <Typography >
                          Yes: {market.details.yesPrice/1000} ether<br/>
                          No: {market.details.noPrice/1000} ether<br/>
                        </Typography>
                      </CardContent>
                      <CardActions style={{display:'flex', justifyContent:'center', width:'100%'}}>

                      {
                        moment().unix() <= parseInt(market.details.endTime) ? 

                        <Button size="small" color="primary" onClick={() => {setSelectedMarket(index);setParticipateDialog(true)}}>
                          Participate
                        </Button>
                        :
                        market.details.state === '0' ?
 <Button size="small" color="primary" onClick={() => {finalResult(index)}}>
                          Resolve
                        </Button> :

  <Button size="small" color="primary" onClick={() => {withdraw(index)}}>
                          Withdraw
                        </Button>

                      }
                        
                       
                     
                       
              
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                  </>
                }
              </Grid>
            </Container>
          </main>
          {/* Footer */}
          <footer className={classes.footer}>
            <Typography variant="h6" align="center" gutterBottom>
              ConsenSys Academy Bootcamp Final Project
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary" component="p">*
              Blockchain Rocks!
            </Typography>
            <Copyright />
          </footer>
          {/* End footer */}
        </React.Fragment>
      );
    }

    const setupNewMarket = (key, value) => {
      let temp = newMarket;
      temp[key] = value;
      setNewMarket(temp);
    }

    const setupPredict = () => {
      if(predict.verdict !== null) {
        if(predict.verdict === 'yes') {
          return (allMarketsContract[selectedMarket].details.yesPrice/1000) + " Ether";
        } else {
          return (allMarketsContract[selectedMarket].details.noPrice/1000) + " Ether";
        }
      }
    }

    function MarketDialog() {
      return (
        <div>
          <Dialog open={openMarket} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Create a new market</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new market, please enter the name of the the cryptocurrency, amount, action & time interval. <hr/><br/> Token such as ETH, USDC, DAI etc. <br/> Action only as 0 - less than, 1 - more than, 2 - equal to <br/> Amount could be any number <br/> Time Interval in seconds
              </DialogContentText>

              <TextField
                margin="dense"
                id="name"
                label="Token"
                type="text"
                fullWidth
                onChange={(e) => {setupNewMarket('token', e.target.value)}}
              />

               <TextField
                margin="dense"
                id="action"
                label="Action"
                type="text"
                fullWidth
                onChange={(e) => {setupNewMarket('action', e.target.value)}}
              />

               <TextField
                margin="dense"
                id="amount"
                label="Amount"
                type="number"
                fullWidth
                onChange={(e) => {setupNewMarket('amount', e.target.value)}}
              />

               <TextField
                margin="dense"
                id="interval"
                label="Time Interval"
                type="number"
                fullWidth
                onChange={(e) => {setupNewMarket('interval', e.target.value)}}
              />

            </DialogContent>
            <DialogActions>
             {
               loading ? <div style={{display:'flex', justifyContent:'center', width:'100%'}}><CircularProgress/></div> :  
               <>
               <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={createMarket} color="primary">
                Create
              </Button>
              </>
             }
            </DialogActions>
          </Dialog>
        </div>
      );
    }

    function ParticipateDialog() {
      return (
        <div>
          <Dialog open={openParticipate} onClose={() => setParticipateDialog(false)} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Predict to win!</DialogTitle>
            <DialogContent>
              <DialogContentText>
              To predict, please select the verdict and pay.
              </DialogContentText>

              <FormControl component="fieldset">
                <FormLabel component="legend">Verdict</FormLabel>
                <RadioGroup aria-label="verdict" name="verdict1" value={predict.verdict} onChange={(e) => {setPredict({verdict:e.target.value, share:predict.share});}}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>

               {/* <TextField
                margin="dense"
                id="interval"
                label="Shares"
                type="number"
                fullWidth
                value={predict.share}
                onChange={(e) => {setupPredict('share', e.target.value); e.preventDefault();}}
              /> */}
            <Typography >
              Total amount to pay:
              {
                 setupPredict()
              }
            </Typography>
            </DialogContent>
            
            <DialogActions>
             {
               loading ? <div style={{display:'flex', justifyContent:'center', width:'100%'}}><CircularProgress/></div> :  
               <>
               <Button onClick={() => setParticipateDialog(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={makePrediction} color="primary">
                Predict
              </Button>
              </>
             }
            </DialogActions>
          </Dialog>
        </div>
      );
    }



    if(!web3) {
      return (
        <div>Loading Web3, accounts, and contract...</div>
      ) 
    } 
    return(
      <div>
      <Album/>
      <MarketDialog/>
      <ParticipateDialog/>
      </div>
    )
}

export default App;
