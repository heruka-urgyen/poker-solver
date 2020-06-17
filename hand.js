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

//    maybeStraightFlush :: Cards -> Maybe Hand
const maybeStraightFlush = def("maybeStraightFlush")({})([Cards, $.Maybe(Hand)])
  (S.compose
    (S.chain(({cards}) => S.map(({cards}) => ({cards, rank: HAND_RANKS[8]}))(maybeFlush(cards))))
    (maybeStraight))

//    maybeQuads :: Cards -> Maybe Hand
const maybeQuads = def("maybeQuads")({})([Cards, $.Maybe(Hand)])
  (cards => {
    const sorted = sortBy("value")(cards)
    const xs = groupBy("rank")(sorted)
    const maybeQuads = S.find(x => x.length === 4)(xs)
    const maybeKicker = S.head(sorted)

    return S.map(cards => ({cards, rank: HAND_RANKS[7]}))(S.lift2(S.append)(maybeKicker)(maybeQuads))
  })

//    maybeFullHouse :: Cards -> Maybe Hand
const maybeFullHouse = def("maybeFullHouse")({})([Cards, $.Maybe(Hand)])
  (cards => {
    const xs = groupBy("rank")(sortBy("value")(cards))
    const maybeTrips = S.find(x => x.length === 3)(xs)
    const maybePair = S.find(x => x.length === 2)(xs)

    return S.map(cards => ({cards, rank: HAND_RANKS[6]}))(S.lift2(S.concat)(maybeTrips)(maybePair))
  })

//    maybeTrips :: Cards -> Maybe Hand
const maybeTrips = def("maybeTrips")({})([Cards, $.Maybe(Hand)])
  (cards => {
    const sorted = sortBy("value")(cards)
    const xs = groupBy("rank")(sorted)
    const maybeTrips = S.find(x => x.length === 3)(xs)
    const maybeKickers = S.take(2)(sorted)

    return S.map(cards => ({cards, rank: HAND_RANKS[3]}))(S.lift2(S.concat)(maybeTrips)(maybeKickers))
  })

//    maybeTwoPair :: Cards -> Maybe Hand
const maybeTwoPair = def("maybeTwoPair")({})([Cards, $.Maybe(Hand)])
  (cards => {
    const sorted = sortBy("value")(cards)
    const xs = groupBy("rank")(sorted)
    const maybePairs = S.take(4)(S.join(S.filter(x => x.length === 2)(xs)))
    const maybeKicker = S.head(sorted)

    return S.map(cards => ({cards, rank: HAND_RANKS[2]}))(S.lift2(S.append)(maybeKicker)(maybePairs))
  })

//    maybePair :: Cards -> Maybe Hand
const maybePair = def("maybePair")({})([Cards, $.Maybe(Hand)])
  (cards => {
    const xs = groupBy("rank")(sortBy("value")(cards))
    const maybePair = S.find(x => x.length === 2)(xs)
    const maybeKickers = S.take(3)(S.join(S.reject(x => x.length === 2)(xs)))

    return S.map(cards => ({cards, rank: HAND_RANKS[1]}))(S.lift2(S.concat)(maybePair)(maybeKickers))
  })

//    maybeHighCard :: Cards -> Maybe Hand
const maybeHighCard = def("maybeHighCard")({})([Cards, $.Maybe(Hand)])
  (cards => {
    const xs = sortBy("value")(cards)
    const maybeHighCard = S.take(5)(xs)

    return S.map(cards => ({cards, rank: HAND_RANKS[0]}))(maybeHighCard)
  })

module.exports = {
  maybeFlush,
  maybeStraight,
  maybeStraightFlush,
  maybeQuads,
  maybeFullHouse,
  maybeTrips,
  maybeTwoPair,
  maybePair,
  maybeHighCard,
}
