const S = require("sanctuary")
const $ = require("sanctuary-def")
const Descending = require("sanctuary-descending")
const seedrandom = require("seedrandom")

const {def, CARD_RANKS, CARD_SUITS, Card, Cards} = require("./types")

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
const shuffle = rng => deck => {
  const cards = [...deck]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * i)
    const temp = cards[i]

    cards[i] = cards[j]
    cards[j] = temp
  }

  return cards
}

const orderedDeck = () => deck
const randomDeck = () => shuffle(Math.random)(deck)
const seededDeck = def("seededDeck")({})([$.String, Cards])
  (seed => shuffle(seedrandom(seed))(deck))

module.exports = {
  showCard,
  newCard,
  sortCardsBy,
  orderedDeck,
  randomDeck ,
  seededDeck,
}
