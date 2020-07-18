#!/usr/bin/env node

const S = require("sanctuary")
const Pair = require("sanctuary-pair")
const {argv} = require("yargs")
const cliProgress = require("cli-progress")

const {
  STREETS,
  STREET_STATUS,
  ROUND_STATUS,
  newRoundExtended,
  deal,
  computeRoundWinners,
  newCard,
  newDeck,
} = require("./index")

// cli arguments
// p - number of players
// n - number of iterations
// h - hand
const {p, n, h} = argv
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

const getTable = p => ({
  id: "1",
  maxPlayers: p,
  players: S.map(p => ({id: p.toString(), stack: 100}))(S.range(1)(p + 1)),
})

const getRound = p => i => newRoundExtended
  (i.toString())
  (getTable(p))
  ((i - 1) % p)
  (Pair(1)(2))
  ([Pair("1")(S.map(newCard)(h.match(/.{2,2}/g)))])
  (newDeck("shuffle"))

const getNewGame = p => i => ({table: getTable(p), round: getRound(p)(i)})

const goAllIn = ({table, round}) => ({
  table,
  round: {
    ...round,
    status: ROUND_STATUS[2],
    streetStatus: STREET_STATUS[1],
  },
})

bar1.start(n, 0)

const result = S.reduce
  (acc => xs => {
    const winners = xs.map(p => p.playerId)
    const i = Pair.fst(acc)
    const w = Pair.snd(acc)

    if (winners.indexOf("1") > -1) {
      return Pair(i + 1)(w + 1)
    }

    return Pair(i + 1)(w)
  })
  (Pair(0)(0))
  (S.map
    (i => {
      bar1.update(i)

      const r = S.reduce
        (state => f => f(state))
        (getNewGame(p)(i))
        ([deal, goAllIn, deal, deal, deal, computeRoundWinners])

      return r.round.winners
    })
    (S.range(1)(n + 1)))

bar1.stop()

console.log("\n equity:", Pair.snd(result) * 100 / Pair.fst(result) + "%")
