#!/usr/bin/env node

const S = require("sanctuary")
const {argv} = require("yargs").array(["ids", "bets"])

const {calculatePots} = require("./index")

// cli arguments
const {ids, bets} = argv
const playerIds = S.map(x => x.toString())(ids)
const result =
  calculatePots(S.zipWith(playerId => amount => ({playerId, amount}))(playerIds)(bets))

console.dir(result, {depth: null, colors: true})
