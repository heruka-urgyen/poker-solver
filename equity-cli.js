#!/usr/bin/env node

const S = require("sanctuary")
const Pair = require("sanctuary-pair")
const {argv} = require("yargs")
const cliProgress = require("cli-progress")

const {newRound, playRound, newCard, newDeck} = require("./index")

// cli arguments
// p - number of players
// n - number of iterations
// h - hand
const {p, n, h} = argv
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

bar1.start(n, 0)

const result = S.reduce
  (acc => x => {
    const {playerId} = x[0]
    const i = Pair.fst(acc)
    const w = Pair.snd(acc)

    if (playerId === "1") {
      return Pair(i + 1)(w + 1)
    }

    return Pair(i + 1)(w)
  })
  (Pair(0)(0))
  (S.map
    (i =>
      (bar1.update(i),
        playRound
          (newRound
            (i)
            ({
              id: 1,
              maxPlayers: p,
              players: S.map(p => ({id: `${p}`}))(S.range(1)(p + 1)),
              button: (i - 1) % p})
            ([Pair("1")(S.map(newCard)(h.match(/.{2,2}/g)))])
            (newDeck("shuffle"))).winners))
    (S.range(1)(n + 1)))

bar1.stop()

console.log("\n equity:", Pair.snd(result) * 100 / Pair.fst(result) + "%")
