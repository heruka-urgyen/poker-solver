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

const DECK = S.chain(r => S.map(s => newCard(r + s))(CARD_SUITS))(CARD_RANKS)

const shuffle = deck => {
  const sorted = [...deck]

  for (let i = sorted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = sorted[i]

    sorted[i] = sorted[j]
    sorted[j] = temp
  }

  return sorted
}

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

//    newRound :: Int -> Table -> [Card] -> Round
const newRound = def("newRound")({})([$.PositiveInteger, Table, Cards, Round])
  (id => table => deck => ({
    id,
    deck,
    communityCards: [],
    table: {
      ...table,
      button: (table.button + 1) % table.players.length,
    },
    cards: [],
  }))

//    deal :: Round -> Street -> Round
const deal = def("deal")({})([Round, Street, Round])
  (round => street => {
    if (street === STREETS[0]) {
      const {players} = round.table
      const {deck} = round

      const cards = S.map
        (p => S.Pair
          (p.id)
          ([deck[players.indexOf(p)], deck[players.indexOf(p) + players.length]]))
        (players)

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



module.exports = {
  newTable,
  sitPlayer,
  newRound,
  shuffle,
  deal,
}
