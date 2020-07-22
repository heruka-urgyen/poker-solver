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
  _computeRoundWinners,
  computeRoundWinners,
  endRound,
  newGame,
} = require ("../src/game")

const {STREETS, ROUND_STATUS} = require("../src/types")
const {newCard, showCard, orderedDeck, randomDeck} = require("../src/card")
const {postBlinds, bet} = require("../src/bet")

const deck = orderedDeck()

const table1 = {
  id: "1",
  maxPlayers: 2,
  players: [{id: "1", stack: 50}, {id: "2", stack: 30}],}

const table2 = {
  id: "1",
  maxPlayers: 3,
  players: [{id: "1", stack: 50}, {id: "2", stack: 30}, {id: "3", stack: 70}],}

const table3 = {
  id: "1",
  maxPlayers: 4,
  players: [
    {id: "1", stack: 50},
    {id: "2", stack: 30},
    {id: "3", stack: 70},
    {id: "4", stack: 65}],}

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
      streetStatus: "IN_PROGRESS",
      tableId: "1",
      deck: S.filter(c => !(showCard(c) === "As" || showCard(c) === "Kc"))(deck),
      communityCards: [],
      cards: [
        Pair("1")([]),
        Pair("2")([{rank: "A", suit: "s", value: 13}, {rank: "K", suit: "c", value: 12}]),
        Pair("3")([]),
        Pair("4")([])],
      button: 1,
      utg: "1",
      nextPlayer: "1",
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
    table: {id: "1", maxPlayers: 4, players: [{id: "1"}, {id: "2"}, {id: "3"}]},
    round: {
      id: "1",
      status: ROUND_STATUS[0],
      street: STREETS[0],
      streetStatus: "IN_PROGRESS",
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
    },
  })

  t.deepEqual(
    [r.round.deck, r.round.cards],
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
    table: {id: "1", maxPlayers: 3, players: [{id: "1"}, {id: "2"}, {id: "3"}]},
    round: {
      id: "1",
      status: ROUND_STATUS[0],
      street: STREETS[0],
      streetStatus: "FINISHED",
      tableId: "1",
      deck: deck.slice(6),
      communityCards: [],
      cards: [
        Pair("1")([{rank: "2", suit: "c", value: 1}, {rank: "2", suit: "s", value: 1}]),
        Pair("2")([{rank: "2", suit: "d", value: 1}, {rank: "3", suit: "c", value: 2}]),
        Pair("3")([{rank: "2", suit: "h", value: 1}, {rank: "3", suit: "d", value: 2}]),
      ],
      blinds: Pair(1)(2),
      blindsPosted: true,
      bets: [],
      pots: {pots: [], return: []},
      button: 0,
      players: ["1", "2", "3"],
      winners: [],
    },
  })

  t.deepEqual(
    [r.round.deck, r.round.communityCards, r.round.cards],
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
    table: {id: "1", maxPlayers: 4, players: [{id: "1"}, {id: "2"}, {id: "3"}]},
    round: {
      id: "1",
      status: ROUND_STATUS[0],
      street: STREETS[1],
      streetStatus: "FINISHED",
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
    },
  })

  t.deepEqual(
    [r.round.deck, r.round.communityCards, r.round.cards],
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
    table: {id: "1", maxPlayers: 4, players: [{id: "1"}, {id: "2"}, {id: "3"}]},
    round: {
      id: "1",
      status: ROUND_STATUS[0],
      street: STREETS[2],
      streetStatus: "FINISHED",
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
    },
  })

  t.deepEqual(
    [r.round.deck, r.round.communityCards, r.round.cards],
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
  const result = _computeRoundWinners({
    id: "1",
    status: ROUND_STATUS[0],
    street: STREETS[4],
    streetStatus: "FINISHED",
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
    status: ROUND_STATUS[0],
    street: STREETS[0],
    streetStatus: "IN_PROGRESS",
    tableId: "1",
    deck: S.filter(c => !(showCard(c) === "As" || showCard(c) === "Kc"))(deck),
    button: 1,
    utg: "1",
    nextPlayer: "1",
    blinds: Pair(1)(2),
    blindsPosted: false,
    bets: [],
    players: ["1", "2", "3", "4"],
    winners: [],
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

  const r0 = computeRoundWinners({table, round})
  const r1 = endRound(r0)

  t.deepEqual(
    r1.table.players,
    [{id: "1", stack: 40}, {id: "2", stack: 90}, {id: "3", stack: 20}],
  )
})

test("2-players: leavePlayer", t => {
  const table = {
    id: "1",
    players: [{id: "1", stack: 5}, {id: "2", stack: 20}],
    maxPlayers: 3,
  }

  const r = newGame(table)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(1))
    .update(actions => actions.bet(18))
    .update(actions => actions.leave("2"))
    .update(actions => actions.getWinners)
    .getAll()

  t.deepEqual(r[7].table.players, [{id: "1", stack: 3}])
  t.deepEqual(r[7].round.players, ["1"])
  t.deepEqual(r[7].round.bets, [])
  t.deepEqual(r[7].table.players, [{id: "1", stack: 3}])
  t.deepEqual(
    r[7].round.pots,
    {
      pots: [
        {players: ["1"], amount: 4},
      ],
      return: [],
    },
  )
})

test("2-players: leavePlayer preflop", t => {
  const table = {
    id: "1",
    players: [{id: "1", stack: 20}, {id: "2", stack: 20}],
    maxPlayers: 3,
  }

  const r = newGame(table)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.leave("1"))
    .update(actions => actions.getWinners)
    .getAll()

  t.deepEqual(r[3].round.players, ["2"])
  t.deepEqual(r[3].round.bets, [])
  t.deepEqual(r[3].table.players, [{id: "2", stack: 19}])
  t.deepEqual(
    r[3].round.pots,
    {
      pots: [
        {players: ["2"], amount: 2},
      ],
      return: [],
    },
  )
  t.deepEqual(r[4].round.winners.map(w => w.playerId), ["2"])
})

test("2-player: bet - fold", t => {
  const res1 = {
    players: [{id: "1", stack: 39}, {id: "2", stack: 28}],
    bets: [{playerId: "1", amount: 11}, {playerId: "2", amount: 2}],
    pots: {pots: [], return: []},
  }

  const res2 = {
    players: [{id: "1", stack: 48}, {id: "2", stack: 28}],
    bets: [],
    pots: {
      pots: [{amount: 4, players: ["1"]}],
      return: [],
    },
  }

  const r = newGame(table1)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(10))
    .update(actions => actions.fold)
    .getAll()

  const [r1, r2] =
    [r[4], r[5]].map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
})

test("2-player: call - check - bet - fold", t => {
  const res1 = {
    players: [{id: "1", stack: 48}, {id: "2", stack: 28}],
    bets: [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}],
    pots: {pots: [], return: []},
  }

  const res2 = {
    players: [{id: "1", stack: 48}, {id: "2", stack: 28}],
    bets: [],
    pots: {
      pots: [{amount: 4, players: ["1", "2"]}],
      return: [],
    },
  }
  const res3 = {
    players: [{id: "1", stack: 38}, {id: "2", stack: 28}],
    bets: [{playerId: "1", amount: 10}],
    pots: {
      pots: [{amount: 4, players: ["1", "2"]}],
      return: [],
    },
  }

  const res4 = {
    players: [{id: "1", stack: 48}, {id: "2", stack: 28}],
    bets: [],
    pots: {
      pots: [{amount: 4, players: ["1"]}],
      return: [],
    },
  }

  const r = newGame(table1)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(1))
    .update(actions => actions.bet(0))
    .update(actions => actions.deal)
    .update(actions => actions.bet(10))
    .update(actions => actions.fold)
    .getAll()

  const [r1, r2, r3, r4] = [r[4], r[5], r[7], r[8]]
    .map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
  t.deepEqual(r4, res4)
})

test("3-player: bet - fold - call", t => {
  const res1 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 29}, {id: "3", stack: 68}],
    bets:
      [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "1", amount: 10}],
    pots: {pots: [], return: []},
  }

  const res2 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 29}, {id: "3", stack: 68}],
    bets:
      [{playerId: "3", amount: 2}, {playerId: "1", amount: 10}],
    pots: {
      pots: [{amount: 1, players: ["1", "3"]}],
      return: [],
    },
  }

  const res3 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 29}, {id: "3", stack: 60}],
    bets: [],
    pots: {
      pots: [{amount: 21, players: ["1", "3"]}],
      return: [],
    },
  }

  const r = newGame(table2)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(10))
    .update(actions => actions.fold)
    .update(actions => actions.bet(8))
    .getAll()

  const [r1, r2, r3] = [r[4], r[5], r[6]]
    .map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})

test("3-player: bet - call - fold", t => {
  const res1 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 29}, {id: "3", stack: 68}],
    bets:
      [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "1", amount: 10}],
    pots: {pots: [], return: []},
  }

  const res2 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 20}, {id: "3", stack: 68}],
    bets:
      [{playerId: "2", amount: 10}, {playerId: "3", amount: 2}, {playerId: "1", amount: 10}],
    pots: {
      pots: [],
      return: [],
    },
  }

  const res3 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 20}, {id: "3", stack: 68}],
    bets: [],
    pots: {
      pots: [{amount: 22, players: ["1", "2"]}],
      return: [],
    },
  }

  const r = newGame(table2)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(10))
    .update(actions => actions.bet(9))
    .update(actions => actions.fold)
    .getAll()

  const [r1, r2, r3] = [r[4], r[5], r[6]]
    .map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})

test("2-player: limp - check", t => {
  const res1 = {
    players: [{id: "1", stack: 48}, {id: "2", stack: 28}],
    bets: [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}],
    pots: {
      pots: [],
      return: [],
    },
  }

  const res2 = {
    players: [{id: "1", stack: 48}, {id: "2", stack: 28}],
    bets: [],
    pots: {
      pots: [{amount: 4, players: ["1", "2"]}],
      return: [],
    },
  }

  const r = newGame(table1)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(1))
    .update(actions => actions.bet(0))
    .getAll()

  const [r1, r2] = [r[4], r[5]]
    .map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
})

test("3-player: all in - all in - all in", t => {
  const res1 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 29}, {id: "3", stack: 68}],
    status: ROUND_STATUS[0],
    bets:
      [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "1", amount: 50}],
    pots: {pots: [], return: []},}

  const res2 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 68}],
    status: ROUND_STATUS[0],
    bets:
      [{playerId: "2", amount: 30}, {playerId: "3", amount: 2}, {playerId: "1", amount: 50}],
    pots: {pots: [], return: []},}

  const res3 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 20}],
    status: ROUND_STATUS[2],
    bets: [],
    pots: {
      pots: [
        {players: ["2", "3", "1"], amount: 90},
        {players: ["3", "1"], amount: 40},
      ],
      return: [],
    },}

  const r = newGame(table2)
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(50))
    .update(actions => actions.bet(29))
    .update(actions => actions.bet(68))
    .getAll()

  const [r1, r2, r3] = [r[4], r[5], r[6]]
    .map(({table: {players}, round: {bets, pots, status}}) => ({players, bets, pots, status}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})


test("play round 2 players", t => {
  const table = newTable("1")(3)

  const r = newGame(table)
    .update(actions => actions.sitPlayer({id: "1", stack: 100}))
    .update(actions => actions.sitPlayer({id: "2", stack: 100}))
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(1))
    .update(actions => actions.bet(0))
    .update(actions => actions.deal)
    .update(actions => actions.bet(10))
    .update(actions => actions.bet(10))
    .update(actions => actions.deal)
    .update(actions => actions.bet(0))
    .update(actions => actions.bet(0))
    .update(actions => actions.deal)
    .update(actions => actions.bet(88))
    .update(actions => actions.bet(88))
    .update(actions => actions.getWinners)
    .update(actions => actions.endRound)
    .getAll()

  t.deepEqual(r[3].round.utg, "1")
  t.deepEqual(r[4].round.bets, [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}])
  t.deepEqual(r[4].round.street, STREETS[0])
  t.deepEqual(S.chain(S.extract)(r[5].round.cards).length, 4)
  t.deepEqual(r[6].round.bets, [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}])
  t.deepEqual(r[7].round.pots, {pots: [{amount: 4, players: ["1", "2"]}], return: []})
  t.deepEqual(r[8].round.communityCards.length, 3)
  t.deepEqual(r[8].round.street, STREETS[1])
  t.deepEqual(r[9].round.bets, [{playerId: "1", amount: 10}])
  t.deepEqual(r[9].table.players, [{id: "1", stack: 88}, {id: "2", stack: 98}])
  t.deepEqual(r[10].round.pots, {pots: [{amount: 24, players: ["1", "2"]}], return: []})
  t.deepEqual(r[11].round.communityCards.length, 4)
  t.deepEqual(r[11].round.street, STREETS[2])
  t.deepEqual(r[12].table.players, [{id: "1", stack: 88}, {id: "2", stack: 88}])
  t.deepEqual(r[13].round.pots, {pots: [{amount: 24, players: ["1", "2"]}], return: []})
  t.deepEqual(r[14].round.street, STREETS[3])
  t.deepEqual(r[14].round.communityCards.length, 5)
  t.deepEqual(r[15].table.players, [{id: "1", stack: 0}, {id: "2", stack: 88}])
  t.deepEqual(r[16].round.pots, {pots: [{amount: 200, players: ["1", "2"]}], return: []})
  t.true(r[17].round.winners.length > 0)
  t.deepEqual(r[18].round.status, ROUND_STATUS[1])
  t.regex(S.map(p => p.stack)(r[18].table.players).toString(), /100,100|200|200/)
})

test("play round 3 players", t => {
  const table = newTable("1")(3)

  const r = newGame(table)
    .update(actions => actions.sitPlayer({id: "1", stack: 100}))
    .update(actions => actions.sitPlayer({id: "2", stack: 100}))
    .update(actions => actions.sitPlayer({id: "3", stack: 100}))
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(10))
    .update(actions => actions.bet(9))
    .update(actions => actions.bet(8))
    .update(actions => actions.deal)
    .update(actions => actions.bet(10))
    .update(actions => actions.fold)
    .update(actions => actions.bet(90))
    .update(actions => actions.bet(80))
    .update(actions => actions.deal)
    .update(actions => actions.deal)
    .update(actions => actions.getWinners)
    .update(actions => actions.endRound)
    .getAll()

  t.deepEqual(r[10].round.pots, {pots: [{amount: 30, players: ["2", "3", "1"]}], return: []})
  t.deepEqual(r[12].round.pots, {pots: [{amount: 30, players: ["1", "3"]}], return: []})
  t.deepEqual(r[12].round.players.length, 2)
  t.deepEqual(r[14].round.status, ROUND_STATUS[2])
  t.deepEqual(r[17].round.pots, {pots: [{amount: 210, players: ["1", "3"]}], return: []})
  t.regex(r[17].round.winners.length.toString(), /1|2/)
  t.regex(S.map(p => p.stack)(r[18].table.players).toString(), /105,90,105|210,90|90,210/)
})

test("play round 3 players all in", t => {
  const table = newTable("1")(3)

  const r = newGame(table)
    .update(actions => actions.sitPlayer({id: "1", stack: 50}))
    .update(actions => actions.sitPlayer({id: "2", stack: 100}))
    .update(actions => actions.sitPlayer({id: "3", stack: 100}))
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(50))
    .update(actions => actions.bet(49))
    .update(actions => actions.bet(48))
    .update(actions => actions.deal)
    .update(actions => actions.bet(50))
    .update(actions => actions.bet(50))
    .update(actions => actions.deal)
    .update(actions => actions.deal)
    .update(actions => actions.getWinners)
    .update(actions => actions.endRound)
    .getAll()

  t.deepEqual(r[5].round.street, STREETS[0])
  t.deepEqual(r[7].round.street, STREETS[0])
  t.deepEqual(r[10].round.street, STREETS[1])
  t.deepEqual(r[13].round.street, STREETS[2])
  t.deepEqual(r[14].round.street, STREETS[3])
  t.deepEqual(r[9].round.pots, {pots: [{amount: 150, players: ["2", "3", "1"]}], return: []})
  t.deepEqual(
    r[12].round.pots,
    {
      pots: [
        {amount: 150, players: ["2", "3", "1"]},
        {amount: 100, players: ["2", "3"]}],
      return: []})
  t.deepEqual(r[12].round.status, ROUND_STATUS[2])

  t.regex(
    S.map(p => p.stack)(r[16].table.players).toString(),
    /150,100|150,100|150,50,50|75,175|75,175|50,100,100|125,125|250|250/)
})

test("play round 3 players all in fold", t => {
  const table = newTable("1")(3)

  const r = newGame(table)
    .update(actions => actions.sitPlayer({id: "1", stack: 50}))
    .update(actions => actions.sitPlayer({id: "2", stack: 100}))
    .update(actions => actions.sitPlayer({id: "3", stack: 100}))
    .update(actions => actions.newRound(randomDeck()))
    .update(actions => actions.postBlinds)
    .update(actions => actions.deal)
    .update(actions => actions.bet(50))
    .update(actions => actions.bet(49))
    .update(actions => actions.bet(48))
    .update(actions => actions.deal)
    .update(actions => actions.bet(50))
    .update(actions => actions.fold)
    .update(actions => actions.deal)
    .update(actions => actions.deal)
    .update(actions => actions.getWinners)
    .update(actions => actions.endRound)
    .getAll()

  t.deepEqual(r[5].round.street, STREETS[0])
  t.deepEqual(r[7].round.street, STREETS[0])
  t.deepEqual(r[10].round.street, STREETS[1])
  t.deepEqual(r[13].round.street, STREETS[2])
  t.deepEqual(r[14].round.street, STREETS[3])

  t.deepEqual(r[9].round.pots, {pots: [{amount: 150, players: ["2", "3", "1"]}], return: []})
  t.deepEqual(
    r[12].table.players,
    [{id: "1", stack: 0}, {id: "2", stack: 50}, {id: "3", stack: 50}])
  t.deepEqual(r[12].round.pots, {pots: [{amount: 150, players: ["1", "2"]}], return: []})
  t.deepEqual(r[12].round.status, ROUND_STATUS[2])
  t.regex(
    S.map(p => p.stack)(r[16].table.players).toString(),
    /150,50,50|200,50|75,125,50/)
})
