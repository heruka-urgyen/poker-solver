const test = require("ava")

const S = require("sanctuary")
const seedrandom = require("seedrandom")

const {CARD_RANKS, CARD_SUITS} = require("../src/types")
const {
  showCard,
  newCard,
  orderedDeck,
  randomDeck ,
  seededDeck,
  sortCardsBy
} = require ("../src/card")

test("newCard", t => {
  t.deepEqual(newCard("2c"), {rank: "2", suit: "c", value: 1})
})

test("showCard", t => {
  t.deepEqual(showCard({rank: "T", suit: "s", value: 9}), "Ts")
})

test("sortCardsBy value", t => {
  t.deepEqual(
    S.map(showCard)(sortCardsBy("value")(S.map(newCard)(["3h", "Ah", "Kc"]))),
    ["Ah", "Kc", "3h"]
  )
})

test("sortCardsBy suit", t => {
  t.deepEqual(
    S.map(showCard)(sortCardsBy("value")(S.map(newCard)(["Tc", "Ah", "Kc"]))),
    ["Ah", "Kc", "Tc"]
  )
})

test("ordered deck", t => {
  t.deepEqual(
    orderedDeck(),
    S.chain(r => S.map(s => newCard(r + s))(CARD_SUITS))(CARD_RANKS)
  )
})

test("shuffled deck", t => {
  t.notDeepEqual(
    randomDeck(),
    randomDeck(),
  )
})

test("newDeck seeded", t => {
  const seed = Math.random().toString()
  t.deepEqual(
    seededDeck(seed),
    seededDeck(seed),
  )
})
