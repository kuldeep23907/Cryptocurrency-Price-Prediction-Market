# Design Pattern Decisions
A summary of design pattern decisions and smart contract best practices taken into account for the Smart contracts.

## Fail early and Fail Loud
Modifiers are used to check for common requirements (such as marketActive, marketInProgress etc.). This way, conditions are checked before the function body is executed, reducing unecessary code execution if the requirements are not met.

## Circuit Breaker
The circuit breaker pattern allows the marketOwneer to pause the contract in the event that it is being abused or a bug is found and the contract needs to be upgraded. The stopInEmergency modifier is run and checks if the contract variable paused is false. If the paused is true, the contract will throw an error if that function is called.

## Withdrawal Pattern

When the market is resolved and final result is calculated, we do not distribute the winning amount for all the users in the same function. We have created a withdraw() method using which user's can withdraw their amount. We took care of the case to update the stae first and then transfer the amount to avoid re-entrancy attack.

## Factory Pattern

As this dapp allows users to create their own market, we have a factory pattern which deploys Market Smart Contract on each request by users. Factory contract keeps the list of all markets.
