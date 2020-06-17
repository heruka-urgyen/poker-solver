const test = require("ava")
const S = require("sanctuary")

const {
  maybeFlush,
  maybeStraight,
  maybeStraightFlush,
  maybeQuads,
  maybeTrips,
  maybeTwoPair,
} = require ("../hand")
const {newCard} = require ("../card")

const highCard = S.map(newCard)(["2c", "4c", "9h", "Ah", "7h", "Jh", "Tc"])
const pair = S.map(newCard)(["2c", "4c", "2h", "Ah", "7h", "Jh", "Tc"])
const twoPair = S.map(newCard)(["2c", "4c", "2h", "Ah", "7h", "4d", "Tc"])
const trips = S.map(newCard)(["2c", "8d", "2h", "Ah", "7h", "2d", "Tc"])
const straight = S.map(newCard)(["2c", "3d", "6h", "4h", "4c", "5d", "Kc"])
const straightWheel = S.map(newCard)(["2c", "3d", "2h", "Ah", "4h", "5d", "Tc"])
const flush = S.map(newCard)(["2h", "4c", "9h", "Ah", "7h", "Jh", "Tc"])
const fullHouse = S.map(newCard)(["2c", "4d", "2h", "Ah", "4h", "2d", "Tc"])
const quads = S.map(newCard)(["2c", "2d", "2h", "Ah", "4h", "2s", "Tc"])
const straightFlush = S.map(newCard)(["2h", "4h", "3h", "Ah", "7h", "5h", "Tc"])

test("maybeFlush -> Nothing; high card", t => {
  t.deepEqual(
    maybeFlush(highCard),
    S.Nothing
  )
})

test("maybeFlush -> Nothing; pair", t => {
  t.deepEqual(
    maybeFlush(pair),
    S.Nothing
  )
})

test("maybeFlush -> Nothing; two pair", t => {
  t.deepEqual(
    maybeFlush(twoPair),
    S.Nothing
  )
})

test("maybeFlush -> Nothing; trips", t => {
  t.deepEqual(
    maybeFlush(trips),
    S.Nothing
  )
})

test("maybeFlush -> Nothing; straight", t => {
  t.deepEqual(
    maybeFlush(straight),
    S.Nothing
  )
})

test("maybeFlush -> Nothing; straight wheel", t => {
  t.deepEqual(
    maybeFlush(straightWheel),
    S.Nothing
  )
})

test("maybeFlush -> Just flush", t => {
  t.deepEqual(
    maybeFlush(flush),
    S.Just({cards: S.map(newCard)(["Ah", "Jh", "9h", "7h", "2h"]), rank: "Flush"})
  )
})

test("maybeFlush -> Nothing; full house", t => {
  t.deepEqual(
    maybeFlush(fullHouse),
    S.Nothing
  )
})

test("maybeFlush -> Nothing; quads", t => {
  t.deepEqual(
    maybeFlush(quads),
    S.Nothing
  )
})

test("maybeStraight -> Nothing; high card", t => {
  t.deepEqual(
    maybeStraight(highCard),
    S.Nothing
  )
})

test("maybeStraight -> Nothing; pair", t => {
  t.deepEqual(
    maybeStraight(pair),
    S.Nothing
  )
})

test("maybeStraight -> Nothing; two pair", t => {
  t.deepEqual(
    maybeStraight(twoPair),
    S.Nothing
  )
})

test("maybeStraight -> Nothing; trips", t => {
  t.deepEqual(
    maybeStraight(trips),
    S.Nothing
  )
})

test("maybeStraight -> just straight", t => {
  t.deepEqual(
    maybeStraight(straight),
    S.Just({cards: S.map(newCard)(["6h", "5d", "4h", "3d", "2c"]), rank: "Straight"})
  )
})

test("maybeStraight -> just wheel", t => {
  t.deepEqual(
    maybeStraight(straightWheel),
    S.Just({cards: S.map(newCard)(["Ah", "5d", "4h", "3d", "2c"]), rank: "Straight"})
  )
})

test("maybeStraight -> Nothing; flush", t => {
  t.deepEqual(
    maybeStraight(flush),
    S.Nothing,
  )
})

test("maybeStraight -> Nothing; full house", t => {
  t.deepEqual(
    maybeStraight(fullHouse),
    S.Nothing
  )
})

test("maybeStraight -> Nothing; quads", t => {
  t.deepEqual(
    maybeStraight(quads),
    S.Nothing
  )
})

test("maybeStraightFlush -> just straight flush", t => {
  t.deepEqual(
    maybeStraightFlush(straightFlush),
    S.Just({cards: S.map(newCard)(["Ah", "5h", "4h", "3h", "2h"]), rank: "Straight Flush"})
  )
})

test("maybeQuads -> Nothing; high card", t => {
  t.deepEqual(
    maybeQuads(highCard),
    S.Nothing
  )
})

test("maybeQuads -> Nothing; pair", t => {
  t.deepEqual(
    maybeQuads(pair),
    S.Nothing
  )
})

test("maybeQuads -> Nothing; two pair", t => {
  t.deepEqual(
    maybeQuads(twoPair),
    S.Nothing
  )
})

test("maybeQuads -> Nothing; trips", t => {
  t.deepEqual(
    maybeQuads(trips),
    S.Nothing
  )
})

test("maybeQuads -> Nothing; straight", t => {
  t.deepEqual(
    maybeQuads(straight),
    S.Nothing
  )
})

test("maybeQuads -> Nothing; straight wheel", t => {
  t.deepEqual(
    maybeQuads(straightWheel),
    S.Nothing
  )
})

test("maybeQuads -> Nothing; flush", t => {
  t.deepEqual(
    maybeQuads(flush),
    S.Nothing
  )
})

test("maybeQuads -> Nothing; full house", t => {
  t.deepEqual(
    maybeQuads(fullHouse),
    S.Nothing
  )
})

test("maybeQuads -> just quads", t => {
  t.deepEqual(
    maybeQuads(quads),
    S.Just({cards: S.map(newCard)(["2c", "2d", "2h", "2s", "Ah"]), rank: "Quads"})
  )
})

test("maybeTrips -> Nothing; high card", t => {
  t.deepEqual(
    maybeTrips(highCard),
    S.Nothing
  )
})

test("maybeTrips -> Nothing; pair", t => {
  t.deepEqual(
    maybeTrips(pair),
    S.Nothing
  )
})

test("maybeTrips -> Nothing; two pair", t => {
  t.deepEqual(
    maybeTrips(twoPair),
    S.Nothing
  )
})


test("maybeTrips -> just trips", t => {
  t.deepEqual(
    maybeTrips(trips),
    S.Just({cards: S.map(newCard)(["2c", "2h", "2d", "Ah", "Tc"]), rank: "Trips"})
  )
})

test("maybeTrips -> Nothing; straight", t => {
  t.deepEqual(
    maybeTrips(straight),
    S.Nothing
  )
})

test("maybeTrips -> Nothing; straight wheel", t => {
  t.deepEqual(
    maybeTrips(straightWheel),
    S.Nothing
  )
})

test("maybeTrips -> Nothing; flush", t => {
  t.deepEqual(
    maybeTrips(flush),
    S.Nothing
  )
})

// test("maybeTrips -> Nothing; full house", t => {
//   t.deepEqual(
//     maybeTrips(fullHouse),
//     S.Nothing
//   )
// })

test("maybeTrips -> Nothing; quads", t => {
  t.deepEqual(
    maybeTrips(quads),
    S.Nothing
  )
})

test("maybeTwoPair -> Nothing; high card", t => {
  t.deepEqual(
    maybeTwoPair(highCard),
    S.Nothing
  )
})

test("maybeTwoPair -> Nothing; pair", t => {
  t.deepEqual(
    maybeTwoPair(pair),
    S.Nothing
  )
})

test("maybeTwoPair -> just two pair", t => {
  t.deepEqual(
    maybeTwoPair(twoPair),
    S.Just({cards: S.map(newCard)(["4c", "4d", "2c", "2h", "Ah"]), rank: "Two Pair"})
  )
})

test("maybeTwoPair -> Nothing; trips", t => {
  t.deepEqual(
    maybeTwoPair(trips),
    S.Nothing
  )
})

test("maybeTwoPair -> Nothing; straight", t => {
  t.deepEqual(
    maybeTwoPair(straight),
    S.Nothing
  )
})

test("maybeTwoPair -> Nothing; straight wheel", t => {
  t.deepEqual(
    maybeTwoPair(straightWheel),
    S.Nothing
  )
})

test("maybeTwoPair -> Nothing; flush", t => {
  t.deepEqual(
    maybeTwoPair(flush),
    S.Nothing
  )
})

test("maybeTwoPair -> Nothing; full house", t => {
  t.deepEqual(
    maybeTwoPair(fullHouse),
    S.Nothing
  )
})

test("maybeTwoPair -> Nothing; quads", t => {
  t.deepEqual(
    maybeTwoPair(quads),
    S.Nothing
  )
})
