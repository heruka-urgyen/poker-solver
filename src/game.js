const $ = require("sanctuary-def")
const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const {
  def,
  CARD_SUITS,
  CARD_RANKS,
  Table,
  Player,
  Cards,
  Hand,
  Round,
  Street,
  STREETS,
} = require("./types")
const {newCard} = require("./card")
const {selectWinningHands} = require("./hand")

//    newTable :: Int -> Int -> Table
const newTable = def("newTable")({})([$.PositiveInteger, $.PositiveInteger, Table])
  (id => maxPlayers => ({
    id,
    maxPlayers,
    players: [],
    button: 0,
  }))

//    sitPlayer :: Table -> Player -> Table
const sitPlayer = def("sitPlayer")({})([Table, Player, Table])
  (table => player => ({
    ...table,
    ...(t => p => {
      const beforeButton = t.players.slice(0, t.button + 1)
      const afterButton = t.players.slice( t.button + 1)
      const newPlayers = [...beforeButton, p, ...afterButton]

      if (newPlayers.length > t.maxPlayers) {
        return {players: t.players}
      }

      return {players: newPlayers}
    })(table)(player),
  }))

//    newRound :: Int -> Table -> [Pair Player.id [Card]] -> [Card] -> Round
const newRound = def
  ("newRound")
  ({})
  ([$.PositiveInteger, Table, $.Array($.Pair(Player.types.id)(Cards)), Cards, Round])
  (id => table => cards => deck => ({
    id,
    table: {
      ...table,
      button: (table.button + 1) % table.players.length,
    },
    deck: S.filter(c => !S.elem(c)(S.chain(S.extract)(cards)))(deck),
    communityCards: [],
    cards: S.map
      (p => S.fromMaybe(S.Pair(p.id)([]))(S.find(c => Pair.fst(c) === p.id)(cards)))
      (table.players),
    winners: [],
  }))

//    deal :: Street -> Round -> Round
const deal = def("deal")({})([Street, Round, Round])
  (street => round => {
    if (street === STREETS[0]) {
      const {players, button} = round.table
      const {deck} = round

      const cards = S.map
        (c => S.map
          (x => x.length === 2? x : [
            deck[(Pair.fst(c) + button + 1) % (players.length)],
            deck[(Pair.fst(c) + button + 1) % (players.length) + players.length]])
          (Pair.snd(c)))
        (S.map(c => Pair(round.cards.indexOf(c))(c))(round.cards))

      return {
        ...round,
        deck: deck.slice(players.length * 2),
        cards,
      }
    }

    if (street === STREETS[1]) {
      const {deck} = round

      return {
        ...round,
        deck: deck.slice(3),
        communityCards: deck.slice(0, 3),
      }
    }

    if (street === STREETS[2] || street === STREETS[3]) {
      const {deck, communityCards} = round

      return {
        ...round,
        deck: deck.slice(1),
        communityCards: S.append(deck[0])(communityCards),
      }
    }
  })

//    computeRoundWinners :: Round -> Round
const computeRoundWinners = def("computeRoundWinners")({})([Round, Round])
  (round => ({
    ...round,
    winners: selectWinningHands(S.map(S.map(S.concat(round.communityCards)))(round.cards))
  }))

//    playRound :: Round -> Round
const playRound = def("playRound")({})([Round, Round])
  (r => {
    const r1 = deal(STREETS[0])(r)
    const r2 = deal(STREETS[1])(r1)
    const r3 = deal(STREETS[2])(r2)
    const r4 = deal(STREETS[3])(r3)

    return computeRoundWinners(r4)
  })

const runGame = state => {
  const recur = (fs, s, res) => {
    if (fs.length === 0) {
      return res
    }

    const f = fs[0]
    const {state, result} = f(s)

    return recur(fs.slice(1), state, S.concat(res)([[result, state]]))
  }

  return update => update((...fs) => recur(fs, state, []))
}

module.exports = {
  newTable,
  sitPlayer,
  newRound,
  deal,
  computeRoundWinners,
  playRound,
  runGame,
}
