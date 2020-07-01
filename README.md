Poker-solver
============

Simple poker solver for texas hold'em written with [sanctuary.js](https://github.com/sanctuary-js) for fun and without any performance optimizations.

Exposes some functions such as

```
showCard :: Card -> CardNotation
newCard :: CardNotation -> Card
newDeck :: (Order | Shuffle) -> Cards
solveHand :: Cards -> Maybe Hand
compareHands :: Hand -> Hand -> [Hand]
selectWinningHands :: [Pair Player.id Cards] -> [Hand]
deal :: Street -> Round -> Round
```

To calculate equity of a hand

```
node equity-cli.js -p <number of players> -n <number of trials> -h <hand>

// input
node equity-cli.js -p 9 -n 100 -h AcKs

// output
equity: 19%
```
