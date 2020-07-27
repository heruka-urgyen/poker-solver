const test = require("ava")
const Pair = require("sanctuary-pair")

const {calculatePots, postBlinds, bet, fold} = require("../src/bet")
const {newGame, newFirstRound} = require("../src/game")
const {randomDeck} = require("../src/card")
const {ROUND_STATUS, STREETS} = require("../src/types")

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

const round = {
  id: "1",
  status: ROUND_STATUS[0],
  street: STREETS[0],
  streetStatus: "IN_PROGRESS",
  tableId: "1",
  deck: randomDeck(),
  communityCards: [],
  cards: [],
  button: 1,
  utg: "1",
  nextPlayer: "1",
  blinds: Pair(1)(2),
  blindsPosted: false,
  bets: [],
  pots: {pots: [], return: []},
  players: ["1", "2"],
  winners: [],
}

test("2-player: SB bet", t => {
  const round1 = {...round, bets: [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]}
  const r = bet({playerId: "1", amount: 9})({table: table1, round: round1})

  t.deepEqual(r.round.nextPlayer, "2")
  t.deepEqual(r.round.whoActed, ["1"])
  t.deepEqual(r.round.bets, [{playerId: "1", amount: 10}, {playerId: "2", amount: 2}])
  t.deepEqual(r.round.pots, {pots: [], return: []})
})

test("2-player: BB bet", t => {
  const round1 = {
      ...round,
      whoActed: ["1"],
      bets: [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}]}
  const r = bet({playerId: "2", amount: 8})({table: table1, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.whoActed, ["2"])
  t.deepEqual(r.round.bets, [{playerId: "1", amount: 2}, {playerId: "2", amount: 10}])
  t.deepEqual(r.round.pots, {pots: [], return: []})
})

test("2-player: BB call", t => {
  const round1 = {
    ...round,
    whoActed: ["1"],
    bets: [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}]}
  const r = bet({playerId: "2", amount: 0})({table: table1, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.whoActed, [])
  t.deepEqual(r.round.bets, [])
  t.deepEqual(r.round.pots, {pots: [{amount: 4, players: ["1", "2"]}], return: []})
})

test("3-player: UTG bet", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3"],
    bets: [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}]}
  const r = bet({playerId: "1", amount: 10})({table: table2, round: round1})

  t.deepEqual(r.round.nextPlayer, "2")
  t.deepEqual(r.round.whoActed, ["1"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
  t.deepEqual(
    r.round.bets,
    [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "1", amount: 10}])
})

test("3-player: SB call", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3"],
    whoActed: ["1"],
    bets:
    [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "1", amount: 10}]}
  const r = bet({playerId: "2", amount: 9})({table: table2, round: round1})

  t.deepEqual(r.round.nextPlayer, "3")
  t.deepEqual(r.round.whoActed, ["1", "2"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
  t.deepEqual(
    r.round.bets,
    [{playerId: "2", amount: 10}, {playerId: "3", amount: 2}, {playerId: "1", amount: 10}])
})

test("3-player: BB call", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3"],
    whoActed: ["1", "2"],
    bets:
    [{playerId: "2", amount: 10}, {playerId: "3", amount: 2}, {playerId: "1", amount: 10}]}
  const r = bet({playerId: "3", amount: 8})({table: table2, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.whoActed, [])
  t.deepEqual(r.round.pots, {pots: [{amount: 30, players: ["2", "3", "1"]}], return: []})
  t.deepEqual(r.round.bets, [])
})

test("4-player: UTG bet", t => {
  const round1 = {
    ...round,
      utg: "4",
    players: ["1", "2", "3", "4"],
    bets: [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}]}
  const r = bet({playerId: "4", amount: 65})({table: table3, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.whoActed, ["4"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
  t.deepEqual(
    r.round.bets,
    [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "4", amount: 65}])
})

test("4-player: BUTTON bet", t => {
  const table = {
    ...table3,
    players: [
      {id: "1", stack: 50},
      {id: "2", stack: 30},
      {id: "3", stack: 68},
      {id: "4", stack: 0}]
  }

  const round1 = {
    ...round,
      utg: "4",
    whoActed: ["4"],
    players: ["1", "2", "3", "4"],
    bets: [
      {playerId: "2", amount: 1},
      {playerId: "3", amount: 2},
      {playerId: "4", amount: 65}]}

  const r = bet({playerId: "1", amount: 50})({table, round: round1})

  t.deepEqual(r.round.nextPlayer, "2")
  t.deepEqual(r.round.whoActed, ["4", "1"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
  t.deepEqual(
    r.round.bets,
    [
      {playerId: "2", amount: 1},
      {playerId: "3", amount: 2},
      {playerId: "4", amount: 65},
      {playerId: "1", amount: 50}])
})

test("4-player: SB bet", t => {
  const table = {
    ...table3,
    players: [
      {id: "1", stack: 0},
      {id: "2", stack: 30},
      {id: "3", stack: 68},
      {id: "4", stack: 0}]
  }

  const round1 = {
    ...round,
    whoActed: ["4", "1"],
    players: ["1", "2", "3", "4"],
    bets: [
      {playerId: "2", amount: 1},
      {playerId: "3", amount: 2},
      {playerId: "4", amount: 65},
      {playerId: "1", amount: 50}]}

  const r = bet({playerId: "2", amount: 29})({table, round: round1})

  t.deepEqual(r.round.nextPlayer, "3")
  t.deepEqual(r.round.whoActed, ["4", "1", "2"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
  t.deepEqual(
    r.round.bets,
    [
      {playerId: "2", amount: 30},
      {playerId: "3", amount: 2},
      {playerId: "4", amount: 65},
      {playerId: "1", amount: 50}])
})

test("4-player: BB bet", t => {
  const table = {
    ...table3,
    players: [
      {id: "1", stack: 0},
      {id: "2", stack: 0},
      {id: "3", stack: 68},
      {id: "4", stack: 0}]
  }

  const round1 = {
    ...round,
    utg: "4",
    whoActed: ["4", "1", "2"],
    players: ["1", "2", "3", "4"],
    bets: [
      {playerId: "2", amount: 30},
      {playerId: "3", amount: 2},
      {playerId: "4", amount: 65},
      {playerId: "1", amount: 50}]}

  const r = bet({playerId: "3", amount: 68})({table, round: round1})

  t.deepEqual(r.round.whoActed, [])
  t.deepEqual(r.round.status, ROUND_STATUS[2])
  t.deepEqual(r.round.bets, [])
  t.deepEqual(r.table.players, [
    {id: "1", stack: 0},
    {id: "2", stack: 0},
    {id: "3", stack: 5},
    {id: "4", stack: 0}])
  t.deepEqual(
    r.round.pots,
    {
      pots: [
        {amount: 120, players: ["2", "3", "4", "1"]},
        {amount: 60, players: ["3", "4", "1"]},
        {amount: 30, players: ["3", "4"]}],
      return: []})
})

test("2-player: SB fold", t => {
  const table = {
    ...table1,
    players: [{id: "1", stack: 49}, {id: "2", stack: 28}]
  }
  const round1 = {...round, bets: [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]}
  const r = fold("1")({table, round: round1})

  t.deepEqual(r.round.nextPlayer, "2")
  t.deepEqual(r.round.players, ["2"])
  t.deepEqual(r.table.players, [{id: "1", stack: 49}, {id: "2", stack: 29}])
  t.deepEqual(r.round.pots, {pots: [{amount: 2, players: ["2"]}], return: []})
})

test("2-player: BB fold", t => {
  const round1 = {...round, bets: [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}]}
  const r = fold("2")({table: table1, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.players, ["1"])
  t.deepEqual(r.round.pots, {pots: [{amount: 4, players: ["1"]}], return: []})
})

test("2-player: fold with non-empty pot", t => {
  const table = {
    ...table1,
    players: [
      {id: "1", stack: 28},
      {id: "2", stack: 18},
    ],
  }
  const round1 = {
      ...round,
      bets: [{playerId: "1", amount: 20}, {playerId: "2", amount: 10}],
      pots: {pots: [{amount: 4, players: ["1", "2"]}], return: []},}
  const r = fold("2")({table, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.players, ["1"])
  t.deepEqual(r.table.players,
    [
      {id: "1", stack: 38},
      {id: "2", stack: 18},
    ],
  )
  t.deepEqual(r.round.pots, {pots: [{amount: 24, players: ["1"]}], return: []})
})

test("3-player: UTG fold", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3"],
    bets: [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}]}
  const r = fold("1")({table: table2, round: round1})

  t.deepEqual(r.round.nextPlayer, "2")
  t.deepEqual(r.round.players, ["2", "3"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
})

test("3-player: SB fold", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3"],
    bets:
      [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "1", amount: 2}]}
  const r = fold("2")({table: table2, round: round1})

  t.deepEqual(r.round.nextPlayer, "3")
  t.deepEqual(r.round.players, ["1", "3"])
  t.deepEqual(r.round.pots, {pots: [{amount: 1, players: ["1", "3"]}], return: []})
})

test("3-player: BB fold", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3"],
    bets:
      [{playerId: "2", amount: 2}, {playerId: "3", amount: 2}, {playerId: "1", amount: 2}]}
  const r = fold("3")({table: table2, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.players, ["1", "2"])
  t.deepEqual(r.round.pots, {pots: [{amount: 2, players: ["1", "2"]}], return: []})
})

test("3-player: fold with non-empty pot", t => {
  const table = {
    ...table2,
    players: [
      {id: "1", stack: 28},
      {id: "2", stack: 8},
      {id: "3", stack: 68},
    ],
  }
  const round1 = {
    ...round,
    whoActed: ["1", "2"],
    players: ["1", "2", "3"],
    pots: {pots: [{amount: 6, players: ["1", "2", "3"]}], return: []},
    bets: [{playerId: "1", amount: 20}, {playerId: "2", amount: 20}]}
  const r = fold("3")({table, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.players, ["1", "2"])
  t.deepEqual(r.round.pots, {pots: [{amount: 46, players: ["1", "2"]}], return: []})
})

test("4-player: UTG fold", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3", "4"],
    bets: [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}]}
  const r = fold("4")({table: table3, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.players, ["1", "2", "3"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
})

test("4-player: BUTTON fold", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3", "4"],
    bets:
      [{playerId: "2", amount: 1}, {playerId: "3", amount: 2}, {playerId: "4", amount: 10}]}
  const r = fold("1")({table: table3, round: round1})

  t.deepEqual(r.round.nextPlayer, "2")
  t.deepEqual(r.round.players, ["2", "3", "4"])
  t.deepEqual(r.round.pots, {pots: [], return: []})
})

test("4-player: SB fold", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3", "4"],
    bets: [
      {playerId: "2", amount: 1},
      {playerId: "3", amount: 2},
      {playerId: "4", amount: 10},
      {playerId: "1", amount: 10}]}
  const r = fold("2")({table: table3, round: round1})

  t.deepEqual(r.round.nextPlayer, "3")
  t.deepEqual(r.round.players, ["1", "3", "4"])
  t.deepEqual(r.round.pots, {pots: [{amount: 1, players: ["1", "3", "4"]}], return: []})
})

test("4-player: BB fold", t => {
  const round1 = {
    ...round,
    players: ["1", "2", "3", "4"],
    bets: [
      {playerId: "2", amount: 10},
      {playerId: "3", amount: 2},
      {playerId: "4", amount: 10},
      {playerId: "1", amount: 10}]}
  const r = fold("3")({table: table3, round: round1})

  t.deepEqual(r.round.nextPlayer, "4")
  t.deepEqual(r.round.players, ["1", "2", "4"])
  t.deepEqual(r.round.pots, {pots: [{amount: 2, players: ["1", "2", "4"]}], return: []})
})

test("4-player: id: 2 folds with non-empty pot", t => {
  const round1 = {
    ...round,
    whoActed: ["4", "1"],
    players: ["1", "2", "3", "4"],
    pots: {pots: [{amount: 8, players: ["1", "2", "3", "4"]}], return: []},
    bets: [{playerId: "4", amount: 63}, {playerId: "1", amount: 48}]}
  const r = fold("2")({table: table3, round: round1})

  t.deepEqual(r.round.nextPlayer, "3")
  t.deepEqual(r.round.players, ["1", "3", "4"])
  t.deepEqual(r.round.pots, {pots: [{amount: 8, players: ["1", "3", "4"]}], return: []})
})

test("4-player: id: 3, id: 4 fold with non-empty pot", t => {
  const table = {
    ...table3,
    players: [
    {id: "1", stack: 0},
    {id: "2", stack: 0},
    {id: "3", stack: 68},
    {id: "4", stack: 53},
    ],
  }
  const round1 = {
    ...round,
    whoActed: ["4", "1"],
    players: ["1", "2", "3", "4"],
    pots: {pots: [{amount: 8, players: ["1", "2", "3", "4"]}], return: []},
    bets: [
      {playerId: "4", amount: 10},
      {playerId: "1", amount: 48},
      {playerId: "2", amount: 28}]}

  const r = fold("3")({table, round: round1})

  t.deepEqual(r.round.nextPlayer, "4")
  t.deepEqual(r.round.players, ["1", "2", "4"])
  t.deepEqual(r.round.pots, {pots: [{amount: 8, players: ["1", "2", "4"]}], return: []})

  const r2 = fold("4")({table: r.table, round: {...r.round, whoActed: ["4", "1", "3"]}})

  t.deepEqual(r2.round.nextPlayer, "1")
  t.deepEqual(r2.round.players, ["1", "2"])
  t.deepEqual(r2.table.players, [
    {id: "1", stack: 20},
    {id: "2", stack: 0},
    {id: "3", stack: 68},
    {id: "4", stack: 53},
  ])
  t.deepEqual(
    r2.round.pots,
    {
      pots: [{amount: 74, players: ["1", "2"]}],
      return: []})
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

