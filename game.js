const $ = require("sanctuary-def")
const S = require("sanctuary")

const {def, CARD_SUITS, CARD_RANKS, Table, Player, Cards, Hand} = require("./types")

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

module.exports = {
  newTable,
  sitPlayer,
}
