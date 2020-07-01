const test = require("ava")

const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const {
  newTable,
  sitPlayer,
  newRound,
  deal,
  computeRoundWinners,
  playRound
} = require ("../src/game")
const {STREETS} = require("../src/types")
const {newCard, showCard, newDeck} = require("../src/card")

const deck = newDeck("order")

test("newTable", t => {
  t.deepEqual(
    newTable(1)(9),
    {id: 1, maxPlayers: 9, players: [], button: 0}
  )
})

test("sitPlayer at empty table", t => {
  t.deepEqual(
    sitPlayer(newTable(1)(9))({id: "1"}),
    {id: 1, maxPlayers: 9, players: [{id: "1"}], button: 0}
  )
})

test("sitPlayer at non-empty table", t => {
  t.deepEqual(
    sitPlayer({id: 1, maxPlayers: 9, players: [{id: "1"}, {id: "2"}], button: 0})({id: "3"}),
    {id: 1, maxPlayers: 9, players: [{id: "1"}, {id: "3"}, {id: "2"}], button: 0}
  )
})

test("sitPlayer at full table", t => {
  t.deepEqual(
    sitPlayer({id: 1, maxPlayers: 2, players: [{id: "1"}, {id: "2"}], button: 0})({id: "3"}),
    {id: 1, maxPlayers: 2, players: [{id: "1"}, {id: "2"}], button: 0}
  )
})

test("newRound", t => {
  t.deepEqual(
    newRound
      (1)
      ({id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 2})
      ([Pair("2")([newCard("As"), newCard("Kc")])])
      (deck),
    {
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: S.filter(c => !(showCard(c) === "As" || showCard(c) === "Kc"))(deck),
      communityCards: [],
      cards: [
        Pair("1")([]),
        Pair("2")([{rank: "A", suit: "s", value: 13}, {rank: "K", suit: "c", value: 12}]),
        Pair("3")([])],
      winners: [],
    }
  )
})

test("deal preflop", t => {
  t.deepEqual(
    deal(STREETS[0])({
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 2},
      deck,
      communityCards: [],
      cards: [Pair("1")([]), Pair("2")([]), Pair("3")([])],
      winners: [],
    }),
    {
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 2},
      deck: deck.slice(6),
      communityCards: [],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }
  )
})

test("deal flop", t => {
  t.deepEqual(
    deal(STREETS[1])({
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(6),
      communityCards: [],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }),
    {
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(9),
      communityCards: [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
      ],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }
  )
})

test("deal turn", t => {
  t.deepEqual(
    deal(STREETS[2])({
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(9),
      communityCards: [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
      ],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }),
    {
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(10),
      communityCards: [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
        {rank: "4", suit: "d", value: 3},
      ],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }
  )
})

test("deal river", t => {
  t.deepEqual(
    deal(STREETS[3])({
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(10),
      communityCards: [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
        {rank: "4", suit: "d", value: 3},
      ],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }),
    {
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(11),
      communityCards: [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
        {rank: "4", suit: "d", value: 3},
        {rank: "4", suit: "h", value: 3},
      ],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }
  )
})

test("computeRoundWinners", t => {
  t.deepEqual(
    computeRoundWinners({
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(11),
      communityCards: [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
        {rank: "4", suit: "d", value: 3},
        {rank: "4", suit: "h", value: 3},
      ],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [],
    }),
    {
      id: 1,
      table: {id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}], button: 0},
      deck: deck.slice(11),
      communityCards: [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
        {rank: "4", suit: "d", value: 3},
        {rank: "4", suit: "h", value: 3},
      ],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      winners: [
        {
          playerId: "1",
          rank: "Full House",
          cards: [
            {rank: "4", suit: "c", value: 3},
            {rank: "4", suit: "d", value: 3},
            {rank: "4", suit: "h", value: 3},
            {rank: "3", suit: "h", value: 2},
            {rank: "3", suit: "s", value: 2},
          ]
        },
        {
          playerId: "2",
          rank: "Full House",
          cards: [
            {rank: "4", suit: "c", value: 3},
            {rank: "4", suit: "d", value: 3},
            {rank: "4", suit: "h", value: 3},
            {rank: "3", suit: "h", value: 2},
            {rank: "3", suit: "s", value: 2},
          ]
        },
        {
          playerId: "3",
          rank: "Full House",
          cards: [
            {rank: "4", suit: "c", value: 3},
            {rank: "4", suit: "d", value: 3},
            {rank: "4", suit: "h", value: 3},
            {rank: "3", suit: "h", value: 2},
            {rank: "3", suit: "s", value: 2},
          ]
        },
      ],
    }
  )
})
