const $ = require("sanctuary-def")
const S = require("sanctuary")
const Descending = require("sanctuary-descending")
const Pair = require("sanctuary-pair")

const {def, HAND_RANKS, Card, Cards, Hand, Player} = require("./types")

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
    const xs = sortBy("length")(groupBy("rank")(sortBy("value")(cards)))
    const maybeTrips = S.find(x => x.length === 3)([xs[0]])
    const maybePair = S.chain(S.take(2))(S.find(x => x.length >= 2)([xs[1]]))

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

//    solveHand :: Cards -> Maybe Hand
const solveHand = def("solveHand")({})([Cards, $.Maybe(Hand)])
  (cards => S.reduce
    (res => f => {
      if (S.isNothing(res)) {
        const maybeHand = f(cards)

        if (S.isJust(maybeHand)) {
          return maybeHand
        }
      }

      return res
    })
    (S.Nothing)
    ([maybeStraightFlush,
      maybeQuads,
      maybeFullHouse,
      maybeFlush,
      maybeStraight,
      maybeTrips,
      maybeTwoPair,
      maybePair,
      maybeHighCard
    ]))

//    compareHands :: Hand -> Hand -> [Hand]
const compareHands = def("compareHands")({})([Hand, Hand, $.Array(Hand)])
  (h1 => h2 => {
    const r1 = HAND_RANKS.indexOf(h1.rank)
    const r2 = HAND_RANKS.indexOf(h2.rank)

    if (r1 === r2) {
      return S.extract(S.reduce
        (acc => x => {
          const count = Pair.fst(acc)
          const res = Pair.snd(acc)

          if (res.length === 0) {
            const v1 = Pair.fst(x).value
            const v2 = Pair.snd(x).value

            if (v1 > v2) {return Pair(count + 1)([h1])}
            if (v1 < v2) {return Pair(count + 1)([h2])}

            if (count === 4) {
              return Pair(count + 1)([h1, h2])
            }
          }

          return Pair(count + 1)(res)
        })
        (Pair(0)([]))
        (S.zip(h1.cards)(h2.cards)))
    }

    if (r1 > r2) {return [h1]}

    return [h2]
  })


//    selectWinningHands :: [Pair Player.id Cards] -> [Hand]
const selectWinningHands = def
  ("selectWinningHands")
  ({})
  ([$.Array($.Pair(Player.types.id)(Cards)), $.Array(Hand)])
  (css => {
    const ids = S.map(Pair.fst)(css)
    const cards = S.map(Pair.snd)(css)

    const hands0 = S.map(S.compose(S.maybeToNullable)(solveHand))(cards)
    const hands = S.map(h => ({...h, playerId: ids[hands0.indexOf(h)]}))(hands0)

    return S.extract(S.reduce
      (acc => h => {
        const f = Pair.fst(acc)
        const currentBest = Pair.snd(acc)
        const nextBest = f(h)
        const nf = compareHands(nextBest[0])

        if (currentBest.indexOf(nextBest[0]) > -1) {
          return Pair(nf)(S.concat(currentBest)(nextBest.slice(1)))
        }

        return Pair(nf)(nextBest)
      })
      (Pair(compareHands(hands[0]))([]))
      (hands.slice(1)))
  })

module.exports = {
  solveHand,
  compareHands,
  selectWinningHands,
}
