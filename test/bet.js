const test = require("ava")
const Pair = require("sanctuary-pair")

const {calculatePots, postBlinds, bet, fold} = require("../src/bet")
const {newGame, newFirstRound} = require("../src/game")
const {newDeck} = require("../src/card")
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
  deck: newDeck("shuffle"),
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

test("2-player: SB fold", t => {
  const round1 = {...round, bets: [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]}
  const r = fold("1")({table: table1, round: round1})

  t.deepEqual(r.round.nextPlayer, "2")
  t.deepEqual(r.round.players, ["2"])
  t.deepEqual(r.round.pots, {pots: [{amount: 3, players: ["2"]}], return: []})
})

test("2-player: BB fold", t => {
  const round1 = {...round, bets: [{playerId: "1", amount: 2}, {playerId: "2", amount: 2}]}
  const r = fold("2")({table: table1, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.players, ["1"])
  t.deepEqual(r.round.pots, {pots: [{amount: 4, players: ["1"]}], return: []})
})

test("2-player: fold with non-empty pot", t => {
  const round1 = {
      ...round,
      bets: [{playerId: "1", amount: 20}, {playerId: "2", amount: 10}],
      pots: {pots: [{amount: 4, players: ["1", "2"]}], return: []},
  }
  const r = fold("2")({table: table1, round: round1})

  t.deepEqual(r.round.nextPlayer, "1")
  t.deepEqual(r.round.players, ["1"])
  t.deepEqual(r.round.pots, {pots: [{amount: 34, players: ["1"]}], return: []})
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
  const round1 = {
    ...round,
    whoActed: ["1", "2"],
    players: ["1", "2", "3"],
    pots: {pots: [{amount: 6, players: ["1", "2", "3"]}], return: []},
    bets: [{playerId: "1", amount: 20}, {playerId: "2", amount: 20}]}
  const r = fold("3")({table: table2, round: round1})

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
  const round1 = {
    ...round,
    whoActed: ["4", "1"],
    players: ["1", "2", "3", "4"],
    pots: {pots: [{amount: 8, players: ["1", "2", "3", "4"]}], return: []},
    bets: [
      {playerId: "4", amount: 10},
      {playerId: "1", amount: 48},
      {playerId: "2", amount: 28}]}

  const r = fold("3")({table: table3, round: round1})

  t.deepEqual(r.round.nextPlayer, "4")
  t.deepEqual(r.round.players, ["1", "2", "4"])
  t.deepEqual(r.round.pots, {pots: [{amount: 8, players: ["1", "2", "4"]}], return: []})

  const r2 = fold("4")({table: r.table, round: {...r.round, whoActed: ["4", "1", "3"]}})

  t.deepEqual(r2.round.nextPlayer, "1")
  t.deepEqual(r2.round.players, ["1", "2"])
  t.deepEqual(
    r2.round.pots,
    {
      pots: [{amount: 74, players: ["1", "2"]}],
      return: [{playerId: "1", amount: 20}]})
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

