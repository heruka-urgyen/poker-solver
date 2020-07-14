const test = require("ava")

const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const {
  newTable,
  sitPlayer,
  leavePlayer,
  newRoundExtended,
  newRound,
  newFirstRound,
  deal,
  computeRoundWinners,
  endRound,
  newGame,
} = require ("../src/game")

const {STREETS, ROUND_STATUS} = require("../src/types")
const {newCard, showCard, newDeck} = require("../src/card")
const {postBlinds, bet} = require("../src/bet")

const deck = newDeck("order")

test("newTable", t => {
  t.deepEqual(
    newTable("1")(9),
    {id: "1", maxPlayers: 9, players: []}
  )
})

test("sitPlayer at empty table", t => {
  const table = newTable("1")(9)

  const game2 = sitPlayer({id: "1"})({table, round: {}})

  t.deepEqual(game2.table.players,[{id: "1"}])
})

test("sitPlayer at non-empty table", t => {
  const table = {id: "1", maxPlayers: 9, players: [{id: "1"}, {id: "2"}]}

  const game1 = {table, round: {}}
  const game2 = sitPlayer({id: "3"})(game1)

  t.deepEqual(game2.table.players,[{id: "1"}, {id: "2"}, {id: "3"}])
})

test("sitPlayer at full table", t => {
  const table = {id: "1", maxPlayers: 2, players: [{id: "1"}, {id: "2"}]}

  const game1 = {table, round: {}}
  const game2 = sitPlayer({id: "3"})(game1)

  t.deepEqual(game2.table.players,[{id: "1"}, {id: "2"}])
})

test("newRoundExtended", t => {
  t.deepEqual(
    newRoundExtended
      ("1")
      ({id: "1", maxPlayers: 4, players: [{id: "1"}, {id: "2"}, {id: "3"}, {id: "4"}]})
      (1)
      (Pair(1)(2))
      ([Pair("2")([newCard("As"), newCard("Kc")])])
      (deck),
    {
      id: "1",
      status: ROUND_STATUS[0],
      street: STREETS[0],
      tableId: "1",
      deck: S.filter(c => !(showCard(c) === "As" || showCard(c) === "Kc"))(deck),
      communityCards: [],
      cards: [
        Pair("1")([]),
        Pair("2")([{rank: "A", suit: "s", value: 13}, {rank: "K", suit: "c", value: 12}]),
        Pair("3")([]),
        Pair("4")([])],
      button: 1,
      nextPlayer: 0,
      blinds: Pair(1)(2),
      blindsPosted: false,
      bets: [],
      pots: {pots: [], return: []},
      players: ["1", "2", "3", "4"],
      winners: [],
    }
  )
})

test("deal preflop", t => {
  const r = deal({
    id: "1",
    status: ROUND_STATUS[0],
    street: STREETS[0],
    tableId: "1",
    deck,
    communityCards: [],
    cards: [],
    button: 2,
    blinds: Pair(1)(2),
    blindsPosted: true,
    bets: [],
    pots: {pots: [], return: []},
    players: ["1", "2", "3"],
    winners: [],
  })

  t.deepEqual(
    [r.deck, r.cards],
    [
      deck.slice(6),
      [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
    ]
  )
})

test("deal flop", t => {
  const r = deal({
    id: "1",
    status: ROUND_STATUS[0],
    street: STREETS[1],
    tableId: "1",
    deck: deck.slice(6),
    communityCards: [],
    cards: [
      Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
      Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
      Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
    ],
    button: 0,
    blinds: Pair(1)(2),
    blindsPosted: true,
    bets: [],
    pots: {pots: [], return: []},
    players: ["1", "2", "3"],
    winners: [],
  })

  t.deepEqual(
    [r.deck, r.communityCards, r.cards],
    [
      deck.slice(9),
      [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
      ],
      [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
    ],
  )
})

test("deal turn", t => {
  const r = deal({
    id: "1",
    status: ROUND_STATUS[0],
    street: STREETS[2],
    tableId: "1",
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
    blindsPosted: true,
    bets: [],
    pots: {pots: [], return: []},
    players: ["1", "2", "3"],
    winners: [],
  })

  t.deepEqual(
    [r.deck, r.communityCards, r.cards],
    [
      deck.slice(10),
      [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
        {rank: "4", suit: "d", value: 3},
      ],
      [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
    ],
  )
})

test("deal river", t => {
  const r = deal({
    id: "1",
    status: ROUND_STATUS[0],
    street: STREETS[3],
    tableId: "1",
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
    blindsPosted: true,
    bets: [],
    pots: {pots: [], return: []},
    players: ["1", "2", "3"],
    winners: [],
  })

  t.deepEqual(
    [r.deck, r.communityCards, r.cards],
    [
      deck.slice(11),
      [
        {rank: "3", suit: "h", value: 2},
        {rank: "3", suit: "s", value: 2},
        {rank: "4", suit: "c", value: 3},
        {rank: "4", suit: "d", value: 3},
        {rank: "4", suit: "h", value: 3},
      ],
      [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
    ],
  )
})

test("computeRoundWinners", t => {
  const result = computeRoundWinners({
    id: "1",
    status: ROUND_STATUS[0],
    street: STREETS[4],
    tableId: "1",
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
    blindsPosted: true,
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
        hand: S.Just({
          rank: "Full House",
          cards: [
            {rank: "4", suit: "c", value: 3},
            {rank: "4", suit: "d", value: 3},
            {rank: "4", suit: "h", value: 3},
            {rank: "3", suit: "h", value: 2},
            {rank: "3", suit: "s", value: 2},
          ]}),
      },
      {
        playerId: "2",
        amount: 0,
        hand: S.Just({
          rank: "Full House",
          cards: [
            {rank: "4", suit: "c", value: 3},
            {rank: "4", suit: "d", value: 3},
            {rank: "4", suit: "h", value: 3},
            {rank: "3", suit: "h", value: 2},
            {rank: "3", suit: "s", value: 2},
          ],
        }),
      },
      {
        playerId: "3",
        amount: 0,
        hand: S.Just({
          rank: "Full House",
          cards: [
            {rank: "4", suit: "c", value: 3},
            {rank: "4", suit: "d", value: 3},
            {rank: "4", suit: "h", value: 3},
            {rank: "3", suit: "h", value: 2},
            {rank: "3", suit: "s", value: 2},
          ]
        }),
      },
    ]
  )
})

test("end round", t => {
  const table = {
    id: "1",
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 20}],
    maxPlayers: 3,
  }

  const round = {
    id: "1",
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
      return: [],
    },
  }

  const run = newGame(table)

  const [_1, _2, _3, r1] = [
    newFirstRound,
    s => ({...s, round: {...s.round, ...round}}),
    s => ({...s, round: computeRoundWinners(s.round)}),
    endRound
  ].map(run)

  t.deepEqual(
    r1.table.players,
    [{id: "1", stack: 40}, {id: "2", stack: 90}, {id: "3", stack: 20}],
  )
})

test("2-players: leavePlayer", t => {
  const table = {
    id: "1",
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}],
    maxPlayers: 3,
  }

  const round = {
    bets: [{amount: 20, playerId: "2"}],
  }

  const run = newGame(table)

  const [_1, _2, r1, r2, r3] = [
    newFirstRound,
    s => ({...s, round: {...s.round, ...round}}),
    leavePlayer("2"),
    s => ({...s, round: computeRoundWinners(s.round)}),
  ].map(run)

  t.deepEqual(
    r1.table.players,
    [{id: "1", stack: 0}],
  )

  t.deepEqual(
    r1.round.players,
    ["1"],
  )

  t.deepEqual(
    r1.round.bets,
    [],
  )

  t.deepEqual(
    r1.round.pots,
    {
      pots: [
        {players: ["1"], amount: 20},
      ],
      return: [],
    },
  )
})

test("2-players: leavePlayer preflop", t => {
  const table = {
    id: "1",
    players: [{id: "1", stack: 0}, {id: "2", stack: 20}],
    maxPlayers: 3,
  }

  const round = {
    bets: [{amount: 20, playerId: "1"}],
    cards: [
      Pair("1")([newCard("3h"), newCard("4d")]),
      Pair("2")([newCard("Ac"), newCard("Ad")]),
    ],
    communityCards: [],
  }

  const run = newGame(table)
  const [_1, _2, r1, r2, r3] = [
    newFirstRound,
    s => ({...s, round: {...s.round, ...round}}),
    leavePlayer("1"),
    s => ({...s, round: computeRoundWinners(s.round)}),
  ].map(run)

  t.deepEqual(
    r1.table.players,
    [{id: "2", stack: 20}],
  )

  t.deepEqual(
    r1.round.players,
    ["2"],
  )

  t.deepEqual(
    r1.round.bets,
    [],
  )

  t.deepEqual(
    r1.round.pots,
    {
      pots: [
        {players: ["2"], amount: 20},
      ],
      return: [],
    },
  )

  t.deepEqual(
    r2.round.winners.map(w => w.playerId),
    ["2"]
  )

})

test("3-players: leavePlayer", t => {
  const table = {
    id: "1",
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 20}],
    maxPlayers: 3,
  }

  const round = {
    bets: [{amount: 20, playerId: "3"}],
    cards: [
      Pair("1")([newCard("3h"), newCard("4d")]),
      Pair("2")([newCard("Ac"), newCard("Ad")]),
      Pair("3")([newCard("Ah"), newCard("Kd")]),
    ],
    communityCards:
      [newCard("As"), newCard("Qc"), newCard("Ts"), newCard("3d"), newCard("9h")],
    pots: {
      pots: [
        {players: ["1", "2", "3"], amount: 90},
        {players: ["1", "3"], amount: 40},
      ],
      return: [],
    },
  }

  const run = newGame(table)
  const [_1, _2, r1, r2, r3] = [
    newFirstRound,
    s => ({...s, round: {...s.round, ...round}}),
    leavePlayer("3"),
    s => ({...s, round: computeRoundWinners(s.round)}),
    endRound,
  ].map(run)

  t.deepEqual(
    r1.round.nextPlayer,
    0
  )

  t.deepEqual(
    r1.table.players,
    [{id: "1", stack: 0}, {id: "2", stack: 0}],
  )

  t.deepEqual(
    r1.round.players,
    ["1", "2"],
  )

  t.deepEqual(
    r1.round.bets,
    [],
  )

  t.deepEqual(
    r1.round.pots,
    {
      pots: [
        {players: ["1", "2"], amount: 110},
        {players: ["1"], amount: 40},
      ],
      return: [],
    },
  )

  t.deepEqual(
    r2.round.winners.map(w => w.playerId),
    ["2", "1"]
  )

  t.deepEqual(
    r3.table.players,
    [{id: "1", stack: 40}, {id: "2", stack: 110}],
  )
})

test("play round", t => {
  const table = newTable("1")(2)
  const run = newGame(table)

  const [
    _1, _2, _3, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16,
  ] = [
    sitPlayer({id: "1", stack: 100}),
    sitPlayer({id: "2", stack: 100}),
    newFirstRound,
    postBlinds,
    s => ({...s, round: deal(s.round)}),
    bet({playerId: "1", amount: 1}),
    bet({playerId: "2", amount: 0}),
    s => ({...s, round: deal(s.round)}),
    bet({playerId: "1", amount: 10}),
    bet({playerId: "2", amount: 10}),
    s => ({...s, round: deal(s.round)}),
    bet({playerId: "1", amount: 0}),
    bet({playerId: "2", amount: 0}),
    s => ({...s, round: deal(s.round)}),
    bet({playerId: "1", amount: 88}),
    bet({playerId: "2", amount: 88}),
    s => ({...s, round: computeRoundWinners(s.round)}),
    endRound,
    newRound,
  ].map(run)

  t.deepEqual(
    r1.round.nextPlayer,
    0
  )

  t.deepEqual(
    r1.round.bets,
    [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}],
  )

  t.deepEqual(
    r1.round.street,
    STREETS[0]
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
    r5.round.street,
    STREETS[1]
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
    r8.round.street,
    STREETS[2]
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
    r10.round.street,
    STREETS[3]
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

  t.deepEqual(
    r15.round.status,
    ROUND_STATUS[1],
  )

  t.regex(
    S.map(p => p.stack)(r15.table.players).toString(),
    /100,100|200,0|0,200/,
  )

  t.deepEqual(
    r16.table,
    r15.table
  )

  t.deepEqual(
    r16.round.tableId,
    r16.table.id,
  )

  t.deepEqual(
    r16.round.button,
    1,
  )

  t.deepEqual(
    r16.round.blindsPosted,
    false,
  )
})
