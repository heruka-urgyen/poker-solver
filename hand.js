const $ = require("sanctuary-def")
const S = require("sanctuary")
const Descending = require("sanctuary-descending")

const {def, HAND_RANKS, Card, Cards, Hand} = require("./types")

const sortBy = s => S.sortBy(x => Descending(x[s]))
const groupBy = s => S.groupBy(x => y => x[s] === y[s])

//    sortRmDup :: Cards -> Cards
const sortRmDup = def("sortRmDup")({})([Cards, Cards])
  (cards => S.justs(S.map(S.head)(groupBy("value")(sortBy("value")(cards)))))

//    maybeFlush :: Cards -> Maybe Hand
const maybeFlush = def("maybeFlush")({})([Cards, $.Maybe(Hand)])
  (cards => S.map
    (cs => ({cards: sortBy("value")(cs), rank: HAND_RANKS[5]}))
    (S.chain
      (S.take(5))
      (S.find
        (x => x.length >= 5)
        (groupBy("suit")(sortBy("suit")(cards))))))

//    maybeStraight :: Cards -> Maybe Hand
const maybeStraight = def("maybeStraight")({})([Cards, $.Maybe(Hand)])
  (cards => {
    const uniqSorted = sortRmDup(cards)
    const ms = S.take(5)
      (S.reduce
        (acc => x => {
          if (acc.length === 5) {return acc}

          if (S.maybe(false)(y => y.value - x.value === 1)(S.last(acc))) {
            return S.append(x)(acc)
          }

          return [x]
        })
        ([])
        (uniqSorted))

    const mw = (S.take(5)(S.filter(x => S.elem(x.rank)(["A", "2", "3", "4", "5"]))(uniqSorted)))

    return S.map(cards => ({cards, rank: HAND_RANKS[4]}))(S.isJust(ms)? ms : mw)
  })

module.exports = {
  maybeFlush,
  maybeStraight,
}
