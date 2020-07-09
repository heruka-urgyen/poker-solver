const test = require("ava")

const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const {
  newTable,
  sitPlayer,
  newRoundExtended,
  newRound,
  deal,
  computeRoundWinners,
  endRound,
  newGame,
} = require ("../src/game")
const {STREETS} = require("../src/types")
const {newCard, showCard, newDeck} = require("../src/card")
const {postBlinds, bet} = require("../src/bet")

const deck = newDeck("order")

test("newTable", t => {
  t.deepEqual(
    newTable(1)(9),
    {id: 1, maxPlayers: 9, players: []}
  )
})

test("sitPlayer at empty table", t => {
  t.deepEqual(
    sitPlayer(newTable(1)(9))({id: "1"}),
    {id: 1, maxPlayers: 9, players: [{id: "1"}]}
  )
})

test("sitPlayer at non-empty table", t => {
  t.deepEqual(
    sitPlayer({id: 1, maxPlayers: 9, players: [{id: "1"}, {id: "2"}]})({id: "3"}),
    {id: 1, maxPlayers: 9, players: [{id: "1"}, {id: "2"}, {id: "3"}]}
  )
})

test("sitPlayer at full table", t => {
  t.deepEqual(
    sitPlayer({id: 1, maxPlayers: 2, players: [{id: "1"}, {id: "2"}]})({id: "3"}),
    {id: 1, maxPlayers: 2, players: [{id: "1"}, {id: "2"}]}
  )
})

test("newRoundExtended", t => {
  t.deepEqual(
    newRoundExtended
      (1)
      ({id: 1, maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}]})
      (0)
      (Pair(1)(2))
      ([Pair("2")([newCard("As"), newCard("Kc")])])
      (deck),
    {
      id: 1,
      tableId: 1,
      deck: S.filter(c => !(showCard(c) === "As" || showCard(c) === "Kc"))(deck),
      communityCards: [],
      cards: [
        Pair("1")([]),
        Pair("2")([{rank: "A", suit: "s", value: 13}, {rank: "K", suit: "c", value: 12}]),
        Pair("3")([])],
      button: 0,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }
  )
})

test("deal preflop", t => {
  t.deepEqual(
    deal(STREETS[0])({
      id: 1,
      tableId: 1,
      deck,
      communityCards: [],
      cards: [],
      button: 2,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }),
    {
      id: 1,
      tableId: 1,
      deck: deck.slice(6),
      communityCards: [],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      button: 2,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }
  )
})

test("deal flop", t => {
  t.deepEqual(
    deal(STREETS[1])({
      id: 1,
      tableId: 1,
      deck: deck.slice(6),
      communityCards: [],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      button: 0,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }),
    {
      id: 1,
      tableId: 1,
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
      button: 0,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }
  )
})

test("deal turn", t => {
  t.deepEqual(
    deal(STREETS[2])({
      id: 1,
      tableId: 1,
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
      button: 0,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }),
    {
      id: 1,
      tableId: 1,
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
      button: 0,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }
  )
})

test("deal river", t => {
  t.deepEqual(
    deal(STREETS[3])({
      id: 1,
      tableId: 1,
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
      button: 0,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }),
    {
      id: 1,
      tableId: 1,
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
      button: 0,
      blinds: Pair(1)(2),
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3"],
      winners: [],
    }
  )
})

test("computeRoundWinners", t => {
  const result = computeRoundWinners({
    id: 1,
    tableId: 1,
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
    button: 0,
    blinds: Pair(1)(2),
    bets: [],
    pots: {pots: [], return: []},
    players: ["1", "2", "3"],
    winners: [],
  })

  t.deepEqual(
    result.winners,
    [
      {
        playerId: "1",
        amount: 0,
        rank: "Full House",
        cards: [
          {rank: "4", suit: "c", value: 3},
          {rank: "4", suit: "d", value: 3},
          {rank: "4", suit: "h", value: 3},
          {rank: "3", suit: "h", value: 2},
          {rank: "3", suit: "s", value: 2},
        ],
      },
      {
        playerId: "2",
        amount: 0,
        rank: "Full House",
        cards: [
          {rank: "4", suit: "c", value: 3},
          {rank: "4", suit: "d", value: 3},
          {rank: "4", suit: "h", value: 3},
          {rank: "3", suit: "h", value: 2},
          {rank: "3", suit: "s", value: 2},
        ],
      },
      {
        playerId: "3",
        amount: 0,
        rank: "Full House",
        cards: [
          {rank: "4", suit: "c", value: 3},
          {rank: "4", suit: "d", value: 3},
          {rank: "4", suit: "h", value: 3},
          {rank: "3", suit: "h", value: 2},
          {rank: "3", suit: "s", value: 2},
        ],
      },
    ]
  )
})

test("end round", t => {
  const table = {
    id: 1,
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 0}],
    maxPlayers: 3,
  }

  const round = {
    ...newRound(1)(table)(0)(Pair(1)(2)),
    cards: [
      Pair("1")([newCard("Ah"), newCard("Kd")]),
      Pair("2")([newCard("Ac"), newCard("Ad")]),
      Pair("3")([newCard("3h"), newCard("4d")]),
    ],
    communityCards:
      [newCard("As"), newCard("Qc"), newCard("Ts"), newCard("3d"), newCard("9h")],
    bets: [],
    pots: {
      pots: [
        {players: ["1", "2", "3"], amount: 90},
        {players: ["1", "3"], amount: 40},
      ],
      return: [{playerId: "3", amount: 20}],
    },
  }

  const game = {
    table,
    round: computeRoundWinners(round),
  }

  const r1 = endRound(game)

  t.deepEqual(
    r1.table.players,
    [{id: "1", stack: 40}, {id: "2", stack: 90}, {id: "3", stack: 20}],
  )
})

test("play round", t => {
  const table =
    sitPlayer(sitPlayer(newTable(1)(2))({id: "1", stack: 100}))({id: "2", stack: 100})
  const round = newRound(1)(table)(0)(Pair(1)(2))

  const run = newGame({table, round})
  const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16] = [
    postBlinds,
    s => ({...s, round: deal(STREETS[0])(s.round)}),
    bet({playerId: "1", amount: 1}),
    bet({playerId: "2", amount: 0}),
    s => ({...s, round: deal(STREETS[1])(s.round)}),
    bet({playerId: "1", amount: 10}),
    bet({playerId: "2", amount: 10}),
    s => ({...s, round: deal(STREETS[2])(s.round)}),
    bet({playerId: "1", amount: 0}),
    bet({playerId: "2", amount: 0}),
    s => ({...s, round: deal(STREETS[3])(s.round)}),
    bet({playerId: "1", amount: 88}),
    bet({playerId: "2", amount: 88}),
    s => ({...s, round: computeRoundWinners(s.round)}),
    endRound,
    s => ({...s, round: newRound(2)(table)(1)(Pair(1)(2))}),
  ].map(run)

  t.deepEqual(
    r1.round.bets,
    [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}],
  )

  t.deepEqual(
    S.chain(S.extract)(r2.round.cards).length,
    4,
  )

  t.deepEqual(
    r3.round.bets,
    [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}],
  )

  t.deepEqual(
    r4.round.pots,
    {pots: [{amount: 4, players: ["1", "2"]}], return: []},
  )

  t.deepEqual(
    r5.round.communityCards.length,
    3,
  )

  t.deepEqual(
    r6.round.bets,
    [{playerId: "1", amount: 10}],
  )

  t.deepEqual(
    r6.table.players,
    [{id: "1", stack: 88}, {id: "2", stack: 98}],
  )

  t.deepEqual(
    r7.round.pots,
    {pots: [{amount: 24, players: ["1", "2"]}], return: []},
  )

  t.deepEqual(
    r8.round.communityCards.length,
    4,
  )

  t.deepEqual(
    r9.table.players,
    [{id: "1", stack: 88}, {id: "2", stack: 88}],
  )

  t.deepEqual(
    r10.round.pots,
    {pots: [{amount: 24, players: ["1", "2"]}], return: []},
  )

  t.deepEqual(
    r11.round.communityCards.length,
    5,
  )

  t.deepEqual(
    r12.table.players,
    [{id: "1", stack: 0}, {id: "2", stack: 88}],
  )

  t.deepEqual(
    r13.round.pots,
    {pots: [{amount: 200, players: ["1", "2"]}], return: []},
  )

  t.true(r14.round.winners.length > 0)

  t.regex(
    S.map(p => p.stack)(r15.table.players).toString(),
    /100,100|200,0|0,200/,
  )

  t.deepEqual(
    r16.table,
    r15.table
  )

  t.deepEqual(
    r16.round,
    newRoundExtended(2)(r16.table)(1)(Pair(1)(2))(r16.round.cards)(r16.round.deck)
  )
})
