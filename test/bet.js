const test = require("ava")

const {calculatePots, bet} = require("../src/bet")

const twoPlayers = [{playerId: "1", stack: 50}, {playerId: "2", stack: 30}]
const threePlayers = [
  {playerId: "1", stack: 50}, {playerId: "2", stack: 30}, {playerId: "3", stack: 70}]
const fourPlayers = [
  {playerId: "1", stack: 50},
  {playerId: "2", stack: 30},
  {playerId: "3", stack: 70},
  {playerId: "4", stack: 65},]

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

test("2-player: bet - call", t => {
  const res1 = {
    players: [{playerId: "1", stack: 45}, {playerId: "2", stack: 30}],
    bets: [{playerId: "1", amount: 5}],
    pots: {},
    balanced: false,}

  const res2 = {
    players: [{playerId: "1", stack: 45}, {playerId: "2", stack: 25}],
    bets: [],
    pots: {
      pots: [{players: ["1", "2"], amount: 10}],
      return: [],
    },
    balanced: true,}

  t.deepEqual(bet({players: twoPlayers, bets: [], bet: {playerId: "1", amount: 5}}), res1)
  t.deepEqual(bet({...res1, bet: {playerId: "2", amount: 5}}), res2)
})

test("2-player: bet - bet - call", t => {
  const blinds = [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]

  const res1 = {
    players: [{playerId: "1", stack: 46}, {playerId: "2", stack: 30}],
    bets: [{playerId: "1", amount: 5}, {playerId: "2", amount: 2}],
    pots: {},
    balanced: false,}

  const res2 = {
    players: [{playerId: "1", stack: 46}, {playerId: "2", stack: 17}],
    bets: [{playerId: "1", amount: 5}, {playerId: "2", amount: 15}],
    pots: {},
    balanced: false,}

  const res3 = {
    players: [{playerId: "1", stack: 36}, {playerId: "2", stack: 17}],
    bets: [],
    pots: {
      pots: [{players: ["1", "2"], amount: 30}],
      return: [],
    },
    balanced: true,}

  t.deepEqual(bet({players: twoPlayers, bets: blinds, bet: {playerId: "1", amount: 4}}), res1)
  t.deepEqual(bet({...res1, bet: {playerId: "2", amount: 13}}), res2)
  t.deepEqual(bet({...res2, bet: {playerId: "1", amount: 10}}), res3)
})

test("2-player: bet - all in - call", t => {
  const blinds = [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]

  const res1 = {
    players: [{playerId: "1", stack: 46}, {playerId: "2", stack: 30}],
    bets: [{playerId: "1", amount: 5}, {playerId: "2", amount: 2}],
    pots: {},
    balanced: false,}

  const res2 = {
    players: [{playerId: "1", stack: 46}, {playerId: "2", stack: 0}],
    bets: [{playerId: "1", amount: 5}, {playerId: "2", amount: 32}],
    pots: {},
    balanced: false,}

  const res3 = {
    players: [{playerId: "1", stack: 19}, {playerId: "2", stack: 0}],
    bets: [],
    pots: {
      pots: [{players: ["1", "2"], amount: 64}],
      return: [],
    },
    balanced: true,}

  t.deepEqual(bet({players: twoPlayers, bets: blinds, bet: {playerId: "1", amount: 4}}), res1)
  t.deepEqual(bet({...res1, bet: {playerId: "2", amount: 30}}), res2)
  t.deepEqual(bet({...res2, bet: {playerId: "1", amount: 27}}), res3)
})

test("2-player: all in - all in", t => {
  const blinds = [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]

  const res1 = {
    players: [{playerId: "1", stack: 0}, {playerId: "2", stack: 30}],
    bets: [{playerId: "1", amount: 51}, {playerId: "2", amount: 2}],
    pots: {},
    balanced: false,}

  const res2 = {
    players: [{playerId: "1", stack: 0}, {playerId: "2", stack: 0}],
    bets: [],
    pots: {
      pots: [{players: ["1", "2"], amount: 64}],
      return: [{playerId: "1", amount: 19}],
    },
    balanced: true,}

  t.deepEqual(
    bet({players: twoPlayers, bets: blinds, bet: {playerId: "1", amount: 50}}), res1)
  t.deepEqual(bet({...res1, bet: {playerId: "2", amount: 30}}), res2)
})


test("3-player: all in - all in - all in", t => {
  const blinds = [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]
  const firstBet = {playerId: "1", amount: 50}
  const res1 = {
    players: [
      {playerId: "1", stack: 0}, {playerId: "2", stack: 30}, {playerId: "3", stack: 70}],
    bets: [{playerId: "1", amount: 51}, {playerId: "2", amount: 2}],
    pots: {},
    balanced: false,}
  const res2 = {
    players: [
      {playerId: "1", stack: 0}, {playerId: "2", stack: 0}, {playerId: "3", stack: 70}],
    bets: [{playerId: "1", amount: 51}, {playerId: "2", amount: 32}],
    pots: {},
    balanced: false,}

  const res3 = {
    players: [
      {playerId: "1", stack: 0}, {playerId: "2", stack: 0}, {playerId: "3", stack: 0}],
    bets: [],
    pots: {
      pots: [
        {players: ["1", "2", "3"], amount: 96},
        {players: ["1", "3"], amount: 38},
      ],
      return: [{playerId: "3", amount: 19}],
    },
    balanced: true,}


  t.deepEqual(bet({players: threePlayers, bets: blinds, bet: firstBet}), res1)
  t.deepEqual(bet({...res1, bet: {playerId: "2", amount: 30}}), res2)
  t.deepEqual(bet({...res2, bet: {playerId: "3", amount: 70}}), res3)
})

test("3-player: bet - all in - bet - call", t => {
  const blinds = [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]
  const firstBet = {playerId: "1", amount: 9}
  const res1 = {
    players: [
      {playerId: "1", stack: 41}, {playerId: "2", stack: 30}, {playerId: "3", stack: 70}],
    bets: [{playerId: "1", amount: 10}, {playerId: "2", amount: 2}],
    pots: {},
    balanced: false,}

  const res2 = {
    players: [
      {playerId: "1", stack: 41}, {playerId: "2", stack: 0}, {playerId: "3", stack: 70}],
    bets: [{playerId: "1", amount: 10}, {playerId: "2", amount: 32}],
    pots: {},
    balanced: false,}

  const res3 = {
    players: [
      {playerId: "1", stack: 41}, {playerId: "2", stack: 0}, {playerId: "3", stack: 28}],
    bets: [
      {playerId: "1", amount: 10}, {playerId: "2", amount: 32}, {playerId: "3", amount: 42}],
    pots: {},
    balanced: false,}

  const res4 = {
    players: [
      {playerId: "1", stack: 9}, {playerId: "2", stack: 0}, {playerId: "3", stack: 28}],
    bets: [],
    pots: {
      pots: [
        {players: ["1", "2", "3"], amount: 96},
        {players: ["1", "3"], amount: 20},
      ],
      return: [],
    },
    balanced: true,}


  t.deepEqual(bet({players: threePlayers, bets: blinds, bet: firstBet}), res1)
  t.deepEqual(bet({...res1, bet: {playerId: "2", amount: 30}}), res2)
  t.deepEqual(bet({...res2, bet: {playerId: "3", amount: 42}}), res3)
  t.deepEqual(bet({...res3, bet: {playerId: "1", amount: 32}}), res4)
})

test("4-player: bet - all in - bet - call - call", t => {
  const blinds = [{playerId: "1", amount: 1}, {playerId: "2", amount: 2}]
  const firstBet = {playerId: "1", amount: 9}
  const res1 = {
    players: [
      {playerId: "1", stack: 41},
      {playerId: "2", stack: 30},
      {playerId: "3", stack: 70},
      {playerId: "4", stack: 65}],
    bets: [{playerId: "1", amount: 10}, {playerId: "2", amount: 2}],
    pots: {},
    balanced: false,}

  const res2 = {
    players: [
      {playerId: "1", stack: 41},
      {playerId: "2", stack: 0},
      {playerId: "3", stack: 70},
      {playerId: "4", stack: 65}],
    bets: [{playerId: "1", amount: 10}, {playerId: "2", amount: 32}],
    pots: {},
    balanced: false,}

  const res3 = {
    players: [
      {playerId: "1", stack: 41},
      {playerId: "2", stack: 0},
      {playerId: "3", stack: 28},
      {playerId: "4", stack: 65}],
    bets: [
      {playerId: "1", amount: 10}, {playerId: "2", amount: 32}, {playerId: "3", amount: 42}],
    pots: {},
    balanced: false,}

  const res4 = {
    players: [
      {playerId: "1", stack: 41},
      {playerId: "2", stack: 0},
      {playerId: "3", stack: 28},
      {playerId: "4", stack: 23}],
    bets: [
      {playerId: "1", amount: 10},
      {playerId: "2", amount: 32},
      {playerId: "3", amount: 42},
      {playerId: "4", amount: 42}],
    pots: {},
    balanced: false,}

  const res5 = {
    players: [
      {playerId: "1", stack: 9},
      {playerId: "2", stack: 0},
      {playerId: "3", stack: 28},
      {playerId: "4", stack: 23}],
    bets: [],
    pots: {
      pots: [
        {players: ["1", "2", "3", "4"], amount: 128},
        {players: ["1", "3", "4"], amount: 30},
      ],
      return: [],
    },
    balanced: true,}


  t.deepEqual(bet({players: fourPlayers, bets: blinds, bet: firstBet}), res1)
  t.deepEqual(bet({...res1, bet: {playerId: "2", amount: 30}}), res2)
  t.deepEqual(bet({...res2, bet: {playerId: "3", amount: 42}}), res3)
  t.deepEqual(bet({...res3, bet: {playerId: "4", amount: 42}}), res4)
  t.deepEqual(bet({...res4, bet: {playerId: "1", amount: 32}}), res5)
})
