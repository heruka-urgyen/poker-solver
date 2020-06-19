const test = require("ava")

const S = require("sanctuary")
const {newTable, sitPlayer} = require ("../game")

test("newTable", t => {
  t.deepEqual(
    newTable(1)(9),
    {id: 1, maxPlayers: 9, players: [], button: 0}
  )
})

test("sitPlayer at empty table", t => {
  t.deepEqual(
    sitPlayer(newTable(1)(9))({id: 1}),
    {id: 1, maxPlayers: 9, players: [{id: 1}], button: 0}
  )
})

test("sitPlayer at non-empty table", t => {
  t.deepEqual(
    sitPlayer({id: 1, maxPlayers: 9, players: [{id: 1}, {id: 2}], button: 0})({id: 3}),
    {id: 1, maxPlayers: 9, players: [{id: 1}, {id: 3}, {id: 2}], button: 0}
  )
})

test("sitPlayer at full table", t => {
  t.deepEqual(
    sitPlayer({id: 1, maxPlayers: 2, players: [{id: 1}, {id: 2}], button: 0})({id: 3}),
    {id: 1, maxPlayers: 2, players: [{id: 1}, {id: 2}], button: 0}
  )
})
