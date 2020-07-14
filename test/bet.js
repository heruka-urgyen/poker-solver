const test = require("ava")
const Pair = require("sanctuary-pair")

const {calculatePots, postBlinds, bet, fold} = require("../src/bet")
const {newGame, newFirstRound} = require("../src/game")
const {newDeck} = require("../src/card")
const {ROUND_STATUS} = require("../src/types")

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

test("2-player: bet - fold", t => {
  const res1 = {
    players: [{id: "1", stack: 39}, {id: "2", stack: 28}],
    bets: [{playerId: "1", amount: 11}, {playerId: "2", amount: 2}],
    pots: {pots: [], return: []},
  }

  const res2 = {
    players: [{id: "1", stack: 39}, {id: "2", stack: 28}],
    bets: [],
    pots: {
      pots: [{amount: 13, players: ["1", "2"]}],
      return: [],
    },
  }

  const run = newGame(table1)
  const [_1, _2, r1, r2] = [
    newFirstRound,
    postBlinds,
    bet({playerId: "1", amount: 10}),
    fold("2"),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

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
    players: [{id: "1", stack: 38}, {id: "2", stack: 28}],
    bets: [],
    pots: {
      pots: [{amount: 14, players: ["1", "2"]}],
      return: [],
    },
  }

  const run = newGame(table1)
  const [_1, _2, r1, r2, r3, r4] = [
    newFirstRound,
    postBlinds,
    bet({playerId: "1", amount: 1}),
    bet({playerId: "2", amount: 0}),
    bet({playerId: "1", amount: 10}),
    fold("2"),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})

test("3-player: bet - fold - call", t => {
  const res1 = {
    players: [{id: "1", stack: 49}, {id: "2", stack: 28}, {id: "3", stack: 60}],
    bets:
      [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}, {playerId: "3", amount: 10}],
    pots: {pots: [], return: []},
  }

  const res2 = {
    players: [{id: "1", stack: 49}, {id: "2", stack: 28}, {id: "3", stack: 60}],
    bets:
      [{playerId: "2", amount: 2}, {playerId: "3", amount: 10}],
    pots: {
      pots: [{amount: 1, players: ["2", "3"]}],
      return: [],
    },
  }

  const res3 = {
    players: [{id: "1", stack: 49}, {id: "2", stack: 20}, {id: "3", stack: 60}],
    bets: [],
    pots: {
      pots: [{amount: 21, players: ["2", "3"]}],
      return: [],
    },
  }

  const run = newGame(table2)
  const [_1, _2, _3, r1, r2, r3] = [
    newFirstRound,
    ({table, round}) => ({table, round: {...round, button: 2}}),
    postBlinds,
    bet({playerId: "3", amount: 10}),
    fold("1"),
    bet({playerId: "2", amount: 8}),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})

test("3-player: bet - call - fold", t => {
  const res1 = {
    players: [{id: "1", stack: 49}, {id: "2", stack: 28}, {id: "3", stack: 60}],
    bets:
      [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}, {playerId: "3", amount: 10}],
    pots: {pots: [], return: []},
  }

  const res2 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 28}, {id: "3", stack: 60}],
    bets:
      [{playerId: "1", amount: 10}, {playerId: "2", amount: 2}, {playerId: "3", amount: 10}],
    pots: {
      pots: [],
      return: [],
    },
  }

  const res3 = {
    players: [{id: "1", stack: 40}, {id: "2", stack: 28}, {id: "3", stack: 60}],
    bets: [],
    pots: {
      pots: [{amount: 22, players: ["1", "3"]}],
      return: [],
    },
  }

  const run = newGame(table2)
  const [_1, _2, _3, r1, r2, r3] = [
    newFirstRound,
    ({table, round}) => ({table, round: {...round, button: 2}}),
    postBlinds,
    bet({playerId: "3", amount: 10}),
    bet({playerId: "1", amount: 9}),
    fold("2"),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})

test("2-player: post blinds", t => {
  const res1 = {
    players: [{id: "1", stack: 49}, {id: "2", stack: 28}],
    bets: [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}],
    pots: {pots: [], return: []},
  }

  const run = newGame(table1)
  const [_, r1] = [
    newFirstRound,
    postBlinds,
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
})

test("2-player: call - call", t => {
  const initialState = {
    table: table1,
    round: {
      pots: {
        pots: [{amount: 4, players: ["1", "2"]}],
        return: [],
      },
    },
  }

  const res1 = {
    players: [{id: "1", stack: 50}, {id: "2", stack: 30}],
    bets: [{playerId: "1", amount: 0}],
    pots: {
      pots: [{amount: 4, players: ["1", "2"]}],
      return: [],
    },
  }

  const res2 = {
    players: [{id: "1", stack: 50}, {id: "2", stack: 30}],
    bets: [],
    pots: {
      pots: [{amount: 4, players: ["1", "2"]}],
      return: [],
    },
  }

  const run = newGame(initialState.table)
  const [_1, _2, r1, r2] = [
    newFirstRound,
    s => ({...s, round: {...s.round, ...initialState.round}}),
    bet({playerId: "1", amount: 0}),
    bet({playerId: "2", amount: 0}),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
})

test("2-player: call - check", t => {
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

  const run = newGame(table1)
  const [_1, _2, r1, r2] = [
    newFirstRound,
    postBlinds,
    bet({playerId: "1", amount: 1}),
    bet({playerId: "2", amount: 0}),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
})

test("3-player: all in - all in - all in", t => {
  const res1 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 28}, {id: "3", stack: 70}],
    status: ROUND_STATUS[0],
    bets: [{playerId: "1", amount: 50}, {playerId: "2", amount: 2}],
    pots: {pots: [], return: []},}

  const res2 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 70}],
    status: ROUND_STATUS[0],
    bets: [{playerId: "1", amount: 50}, {playerId: "2", amount: 30}],
    pots: {pots: [], return: []},}

  const res3 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 20}],
    status: ROUND_STATUS[2],
    bets: [],
    pots: {
      pots: [
        {players: ["1", "2", "3"], amount: 90},
        {players: ["1", "3"], amount: 40},
      ],
      return: [],
    },}

  const run = newGame(table2)
  const [_1, _2, _3, r1, r2, r3] = [
    newFirstRound,
    ({table, round}) => ({table, round: {...round, button: 2}}),
    postBlinds,
    bet({playerId: "1", amount: 49}),
    bet({playerId: "2", amount: 28}),
    bet({playerId: "3", amount: 70}),
  ].map(run)
    .map(({table: {players}, round: {bets, pots, status}}) => ({players, bets, pots, status}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})

test("4-player: bet - all in - bet - call - call", t => {
  const res1 = {
    players: [
      {id: "1", stack: 40},
      {id: "2", stack: 30},
      {id: "3", stack: 69},
      {id: "4", stack: 63}],
    bets: [
      {playerId: "3", amount: 1},
      {playerId: "4", amount: 2},
      {playerId: "1", amount: 10}],
    pots: {pots: [], return: []},}

  const res2 = {
    players: [
      {id: "1", stack: 40},
      {id: "2", stack: 0},
      {id: "3", stack: 69},
      {id: "4", stack: 63}],
    bets: [
      {playerId: "3", amount: 1},
      {playerId: "4", amount: 2},
      {playerId: "1", amount: 10},
      {playerId: "2", amount: 30}],
    pots: {pots: [], return: []},}

  const res3 = {
    players: [
      {id: "1", stack: 40},
      {id: "2", stack: 0},
      {id: "3", stack: 30},
      {id: "4", stack: 63}],
    bets: [
      {playerId: "3", amount: 40},
      {playerId: "4", amount: 2},
      {playerId: "1", amount: 10},
      {playerId: "2", amount: 30},],
    pots: {pots: [], return: []},}

  const res4 = {
    players: [
      {id: "1", stack: 40},
      {id: "2", stack: 0},
      {id: "3", stack: 30},
      {id: "4", stack: 25}],
    bets: [
      {playerId: "3", amount: 40},
      {playerId: "4", amount: 40},
      {playerId: "1", amount: 10},
      {playerId: "2", amount: 30}],
    pots: {pots: [], return: []},}

  const res5 = {
    players: [
      {id: "1", stack: 10},
      {id: "2", stack: 0},
      {id: "3", stack: 30},
      {id: "4", stack: 25}],
    bets: [],
    pots: {
      pots: [
        {players: ["3", "4", "1", "2"], amount: 120},
        {players: ["3", "4", "1"], amount: 30},
      ],
      return: [],
    },}

  const run = newGame(table3)
  const [_1, _2,  _3, r1, r2, r3, r4, r5] = [
    newFirstRound,
    ({table, round}) => ({table, round: {...round, button: 1}}),
    postBlinds,
    bet({playerId: "1", amount: 10}),
    bet({playerId: "2", amount: 30}),
    bet({playerId: "3", amount: 39}),
    bet({playerId: "4", amount: 38}),
    bet({playerId: "1", amount: 30}),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
  t.deepEqual(r4, res4)
  t.deepEqual(r5, res5)
})

test("calculate pots", t => {
  t.deepEqual(
    calculatePots([
      {playerId: "1", amount: 51},
      {playerId: "2", amount: 32},
      {playerId: "3", amount: 70},
    ]),
    {
      pots: [
        {players: ["1", "2", "3"], amount: 96},
        {players: ["1", "3"], amount: 38},
      ],
      return: [{playerId: "3", amount: 19}],
    }
  )
})

test("calculate pots 2", t => {
  t.deepEqual(
    calculatePots([
      {playerId: "1", amount: 100},
      {playerId: "2", amount: 17},
      {playerId: "3", amount: 50},
      {playerId: "4", amount: 30},
      {playerId: "5", amount: 120},
    ]),
    {
      pots: [
        {players: ["1", "2", "3", "4", "5"], amount: 85},
        {players: ["1", "3", "4", "5"], amount: 52},
        {players: ["1", "3", "5"], amount: 60},
        {players: ["1", "5"], amount: 100},
      ],
      return: [{playerId: "5", amount: 20}],
    }
  )
})

test("calculate pots 3", t => {
  t.deepEqual(
    calculatePots([]),
    {pots: [], return: []}
  )
})

