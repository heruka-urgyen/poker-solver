#!/usr/bin/env node

const S = require("sanctuary")
const {argv} = require("yargs").array(["ids", "bets"])

const {calculatePots} = require("./index")

// cli arguments
const {ids, bets} = argv
const playerIds = ids.map(x => x.toString())
const result =
  calculatePots(S.zipWith(playerId => amount => ({playerId, amount}))(playerIds)(bets))

console.dir(result, {depth: null, colors: true})
