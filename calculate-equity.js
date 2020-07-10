#!/usr/bin/env node

const S = require("sanctuary")
const Pair = require("sanctuary-pair")
const {argv} = require("yargs")
const cliProgress = require("cli-progress")

const {
  STREETS,
  newRoundExtended,
  deal,
  computeRoundWinners,
  newGame,
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
  id: 1,
  maxPlayers: p,
  players: S.map(p => ({id: `${p}`}))(S.range(1)(p + 1)),
})

const getRound = p => i => newRoundExtended
  (i)
  (getTable(p))
  ((i - 1) % p)
  (Pair(1)(2))
  ([Pair("1")(S.map(newCard)(h.match(/.{2,2}/g)))])
  (newDeck("shuffle"))

const getNewGame = p => i => newGame({table: getTable(p), round: getRound(p)(i)})

const nextStreet = street => STREETS[STREETS.indexOf(street) + 1]

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
      const run = getNewGame(p)(i)
      const [_1, _2, _3, _4, _5, _6, _7, _8, r] = [
        s => ({...s, round: deal(s.round)}),
        s => ({...s, round: {...s.round, street: nextStreet(s.round.street)}}),
        s => ({...s, round: deal(s.round)}),
        s => ({...s, round: {...s.round, street: nextStreet(s.round.street)}}),
        s => ({...s, round: deal(s.round)}),
        s => ({...s, round: {...s.round, street: nextStreet(s.round.street)}}),
        s => ({...s, round: deal(s.round)}),
        s => ({...s, round: {...s.round, street: nextStreet(s.round.street)}}),
        s => ({...s, round: computeRoundWinners(s.round)}),
      ].map(run)

      return r.round.winners
    })
    (S.range(1)(n + 1)))

bar1.stop()

console.log("\n equity:", Pair.snd(result) * 100 / Pair.fst(result) + "%")
