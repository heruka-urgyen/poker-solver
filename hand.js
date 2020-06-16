const $ = require("sanctuary-def")
const S = require("sanctuary")
const Descending = require("sanctuary-descending")

const {def, HAND_RANKS, Card, Cards, Hand} = require("./types")

const sortBy = s => S.sortBy(x => Descending(x[s]))
const groupBy = s => S.groupBy(x => y => x[s] === y[s])

//    maybeFlush :: Cards -> Maybe Hand
const maybeFlush = def("maybeFlush")({})([Cards, $.Maybe(Hand)])
  (cards => S.map
    (cs => ({cards: sortBy("value")(cs), rank: HAND_RANKS[5]}))
    (S.chain
      (S.take(5))
      (S.find
        (x => x.length >= 5)
        (groupBy("suit")(sortBy("suit")(cards))))))

module.exports = {
  maybeFlush,
}
