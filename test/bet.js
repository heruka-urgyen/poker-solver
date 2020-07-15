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
      pots: [{amount: 13, players: ["1"]}],
      return: [],
    },
  }

  const r = newGame(table1)
    .update(actions => actions.newRound)
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
    players: [{id: "1", stack: 38}, {id: "2", stack: 28}],
    bets: [],
    pots: {
      pots: [{amount: 14, players: ["1"]}],
      return: [],
    },
  }

  const r = newGame(table1)
    .update(actions => actions.newRound)
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
    .update(actions => actions.newRound)
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
    .update(actions => actions.newRound)
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
    .update(actions => actions.newRound)
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
    .update(actions => actions.newRound)
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

