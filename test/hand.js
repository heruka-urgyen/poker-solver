const test = require("ava")
const S = require("sanctuary")

const {solveHand, compareHands} = require ("../hand")
const {newCard} = require ("../card")

const highCard = S.map(newCard)(["2c", "4c", "9h", "Ah", "7h", "Jh", "Tc"])
const highCard2 = S.map(newCard)(["2d", "4s", "9c", "Ac", "7s", "Kc", "Td"])
const pair = S.map(newCard)(["2c", "4c", "2h", "Ah", "7h", "Jh", "Tc"])
const twoPair = S.map(newCard)(["2c", "4c", "2h", "Ah", "7h", "4d", "Tc"])
const trips = S.map(newCard)(["2c", "8d", "2h", "Ah", "7h", "2d", "Tc"])
const straight = S.map(newCard)(["2c", "3d", "6h", "4h", "4c", "5d", "Kc"])
const straight2 = S.map(newCard)(["2d", "3c", "6d", "4s", "4d", "5s", "Kd"])
const straightWheel = S.map(newCard)(["2c", "3d", "2h", "Ah", "4h", "5d", "Tc"])
const flush = S.map(newCard)(["2h", "4c", "9h", "Ah", "7h", "Jh", "Tc"])
const fullHouse = S.map(newCard)(["2c", "4d", "2h", "Ah", "4h", "2d", "Tc"])
const quads = S.map(newCard)(["2c", "2d", "2h", "Ah", "4h", "2s", "Tc"])
const straightFlush = S.map(newCard)(["2h", "4h", "3h", "Ah", "7h", "5h", "Tc"])

test("compare high card and pair", t => {
  t.deepEqual(
    compareHands(S.maybeToNullable(solveHand(highCard)))(S.maybeToNullable(solveHand(pair))),
    [{cards: S.map(newCard)(["2c", "2h", "Ah", "Jh", "Tc"]), rank: "Pair"}]
  )
})

test("compare two high cards", t => {
  t.deepEqual(
    compareHands(S.maybeToNullable(solveHand(highCard)))(S.maybeToNullable(solveHand(highCard2))),
    [{cards: S.map(newCard)(["Ac", "Kc", "Td", "9c", "7s"]), rank: "High Card"}]
  )
})

test("compare two equal straights", t => {
  t.deepEqual(
    compareHands(S.maybeToNullable(solveHand(straight)))(S.maybeToNullable(solveHand(straight2))),
    [
      {cards: S.map(newCard)(["6h", "5d", "4h", "3d", "2c"]), rank: "Straight"},
      {cards: S.map(newCard)(["6d", "5s", "4s", "3c", "2d"]), rank: "Straight"},
    ]
  )
})

test("solve high card", t => {
  t.deepEqual(
    solveHand(highCard),
    S.Just({cards: S.map(newCard)(["Ah", "Jh", "Tc", "9h", "7h"]), rank: "High Card"})
  )
})

test("solve pair", t => {
  t.deepEqual(
    solveHand(pair),
    S.Just({cards: S.map(newCard)(["2c", "2h", "Ah", "Jh", "Tc"]), rank: "Pair"})
  )
})

test("solve two pair", t => {
  t.deepEqual(
    solveHand(twoPair),
    S.Just({cards: S.map(newCard)(["4c", "4d", "2c", "2h", "Ah"]), rank: "Two Pair"})
  )
})

test("solve trips", t => {
  t.deepEqual(
    solveHand(trips),
    S.Just({cards: S.map(newCard)(["2c", "2h", "2d", "Ah", "Tc"]), rank: "Trips"})
  )
})

test("solve straight", t => {
  t.deepEqual(
    solveHand(straight),
    S.Just({cards: S.map(newCard)(["6h", "5d", "4h", "3d", "2c"]), rank: "Straight"})
  )
})

test("solve straight wheel", t => {
  t.deepEqual(
    solveHand(straightWheel),
    S.Just({cards: S.map(newCard)(["Ah", "5d", "4h", "3d", "2c"]), rank: "Straight"})
  )
})

test("solve flush", t => {
  t.deepEqual(
    solveHand(flush),
    S.Just({cards: S.map(newCard)(["Ah", "Jh", "9h", "7h", "2h"]), rank: "Flush"})
  )
})

test("solve full house", t => {
  t.deepEqual(
    solveHand(fullHouse),
    S.Just({cards: S.map(newCard)(["2c", "2h", "2d", "4d", "4h"]), rank: "Full House"})
  )
})

test("solve quads", t => {
  t.deepEqual(
    solveHand(quads),
    S.Just({cards: S.map(newCard)(["2c", "2d", "2h", "2s", "Ah"]), rank: "Quads"})
  )
})

test("solve straight flush", t => {
  t.deepEqual(
    solveHand(straightFlush),
    S.Just({cards: S.map(newCard)(["Ah", "5h", "4h", "3h", "2h"]), rank: "Straight Flush"})
  )
})
