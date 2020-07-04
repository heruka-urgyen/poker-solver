const test = require("ava")

const {calculatePots} = require("../src/bet")

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
