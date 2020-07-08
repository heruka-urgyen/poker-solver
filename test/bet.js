const test = require("ava")
const Pair = require("sanctuary-pair")

const {calculatePots, postBlinds, bet} = require("../src/bet")
const {newGame, newRound} = require("../src/game")
const {newDeck} = require("../src/card")

const table1 = {
  id: 1,
  maxPlayers: 2,
  players: [{id: "1", stack: 50}, {id: "2", stack: 30}],}

const table2 = {
  id: 1,
  maxPlayers: 3,
  players: [{id: "1", stack: 50}, {id: "2", stack: 30}, {id: "3", stack: 70}],}

const table3 = {
  id: 1,
  maxPlayers: 4,
  players: [
    {id: "1", stack: 50},
    {id: "2", stack: 30},
    {id: "3", stack: 70},
    {id: "4", stack: 65}],}

test("2-player: call - call", t => {
  const initialState = {
    table: table1,
    round: {
      ...newRound(1)(table1)(0)(Pair(1)(2)),
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

  const run = newGame(initialState)
  const [r1, r2] = [
    bet({playerId: "1", amount: 0}),
    bet({playerId: "2", amount: 0}),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
})

test("2-player: call - check", t => {
  const initialState = {
    table: table1,
    round: newRound(1)(table1)(0)(Pair(1)(2)),
  }

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

  const run = newGame(initialState)
  const [_, r1, r2] = [
    postBlinds,
    bet({playerId: "1", amount: 1}),
    bet({playerId: "2", amount: 0}),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
})

test("3-player: all in - all in - all in", t => {
  const initialState = {
    table: table2,
    round: newRound(1)(table2)(2)(Pair(1)(2)),
  }

  const res1 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 28}, {id: "3", stack: 70}],
    bets: [{playerId: "1", amount: 50}, {playerId: "2", amount: 2}],
    pots: {pots: [], return: []},}

  const res2 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 70}],
    bets: [{playerId: "1", amount: 50}, {playerId: "2", amount: 30}],
    pots: {pots: [], return: []},}

  const res3 = {
    players: [{id: "1", stack: 0}, {id: "2", stack: 0}, {id: "3", stack: 0}],
    bets: [],
    pots: {
      pots: [
        {players: ["1", "2", "3"], amount: 90},
        {players: ["1", "3"], amount: 40},
      ],
      return: [{playerId: "3", amount: 20}],
    },}

  const run = newGame(initialState)
  const [_, r1, r2, r3] = [
    postBlinds,
    bet({playerId: "1", amount: 49}),
    bet({playerId: "2", amount: 28}),
    bet({playerId: "3", amount: 70}),
  ].map(run).map(({table: {players}, round: {bets, pots}}) => ({players, bets, pots}))

  t.deepEqual(r1, res1)
  t.deepEqual(r2, res2)
  t.deepEqual(r3, res3)
})

test("4-player: bet - all in - bet - call - call", t => {
  const initialState = {
    table: table3,
    round: newRound(1)(table3)(1)(Pair(1)(2)),
  }

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

  const run = newGame(initialState)
  const [_, r1, r2, r3, r4, r5] = [
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

