const test = require("ava")

const S = require("sanctuary")
const {maybeFlush} = require ("../hand")
const {newCard, sortCardsBy} = require ("../card")

const highCard = S.map(newCard)(["2c", "4c", "9h", "Ah", "7h", "Jh", "Tc"])
const pair = S.map(newCard)(["2c", "4c", "2h", "Ah", "7h", "Jh", "Tc"])
const twoPair = S.map(newCard)(["2c", "4c", "2h", "Ah", "7h", "4d", "Tc"])
const trips = S.map(newCard)(["2c", "8d", "2h", "Ah", "7h", "2d", "Tc"])
const straight = S.map(newCard)(["2c", "3d", "6h", "Ah", "4h", "5d", "Tc"])
const straightWheel = S.map(newCard)(["2c", "3d", "8h", "Ah", "4h", "5d", "Tc"])
const flush = S.map(newCard)(["2h", "4c", "9h", "Ah", "7h", "Jh", "Tc"])
const fullHouse = S.map(newCard)(["2c", "4d", "2h", "Ah", "4h", "2d", "Tc"])
const quads = S.map(newCard)(["2c", "2d", "2h", "Ah", "4h", "2s", "Tc"])
// const straightFlush = S.map(newCard)(["2h", "4h", "3h", "Ah", "7h", "5h", "Tc"])

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

// test("maybeFlush -> Nothing; straight flush", t => {
//   t.deepEqual(
//     maybeFlush(straightFlush),
//     S.Nothing
//   )
// })
//
//
