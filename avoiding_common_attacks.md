# Attacks avoided

This is the list of common attacks tackled in the smart contracts.

## Reentrancy Attack

The withdraw() method was prone to this attack so I have used OpenZeppelin's Re-entranceGuard to protect it. It's a modifier which stops the execution of a function after it's first call and allows it once the first call is finalised.

## Underflow - Overflow Attack

As the main contract involves a lot of calculations so it could lead to this attack. Again, I have used OpenZeppelin's SafeMath to secure it. 

