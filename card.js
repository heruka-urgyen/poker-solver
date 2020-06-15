const $ = require("sanctuary-def")
const {def, CARD_RANKS, Card} = require("./types")

//    showCard :: Card -> CardNotation
const showCard = def("showCard")({})([Card, $.String])
  (({rank, suit}) => rank + suit)

//    newCard :: CardNotation -> Card
const newCard = def("newCard")({})([$.String, Card])
  (([rank, suit]) => ({rank, suit, value: CARD_RANKS.indexOf (rank) + 1}))

module.exports = {
  showCard,
  newCard,
}
