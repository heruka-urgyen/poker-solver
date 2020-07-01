const S = require("sanctuary")
const $ = require("sanctuary-def")
const {def, CARD_RANKS, CARD_SUITS, Card, Cards} = require("./types")
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

const deck = S.chain(r => S.map(s => newCard(r + s))(CARD_SUITS))(CARD_RANKS)
const shuffle = deck => type => {
  if (type === "order") {return deck}

  const sorted = [...deck]

  for (let i = sorted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = sorted[i]

    sorted[i] = sorted[j]
    sorted[j] = temp
  }

  return sorted
}

//    newDeck :: (Order | Shuffle) -> Cards
const newDeck = def("newDeck")({})([$.String, Cards])
  (shuffle(deck))

module.exports = {
  showCard,
  newCard,
  sortCardsBy,
  newDeck,
}
