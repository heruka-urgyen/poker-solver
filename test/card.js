const test = require("ava")
const {showCard, newCard} = require ("../card")

test("newCard", t => {
  t.deepEqual(newCard("2c"), {rank: "2", suit: "c", value: 1})
})

test("showCard", t => {
  t.deepEqual(showCard({rank: "T", suit: "s", value: 9}), "Ts")
})
