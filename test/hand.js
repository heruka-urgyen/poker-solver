const test = require("ava")

const S = require("sanctuary")
const {maybeFlush, maybeStraight, maybeStraightFlush} = require ("../hand")
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
