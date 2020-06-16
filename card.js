const S = require("sanctuary")
const $ = require("sanctuary-def")
const {def, CARD_RANKS, Card, Cards} = require("./types")
const Descending = require("sanctuary-descending")

//    showCard :: Card -> CardNotation
const showCard = def("showCard")({})([Card, $.String])
  (({rank, suit}) => rank + suit)

//    newCard :: CardNotation -> Card
const newCard = def("newCard")({})([$.String, Card])
  (([rank, suit]) => ({rank, suit, value: CARD_RANKS.indexOf (rank) + 1}))

//    sortCardsBy :: String -> Cards -> Cards
const sortCardsBy = def("sortCardsBy")({})([$.String, Cards, Cards])
  (s => S.sortBy (x => Descending(x[s])))

module.exports = {
  showCard,
  newCard,
  sortCardsBy,
}
