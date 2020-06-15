const S = require("sanctuary")
const $ = require("sanctuary-def")

const env = $.env;
const def = $.create ({checkTypes: true, env})

const CARD_RANKS =  ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]

//    Rank :: Type
const Rank = $.NullaryType ("Rank") ("") ([$.String])
  (x => CARD_RANKS.indexOf(x) > -1)

//    Suit :: Type
const Suit = $.NullaryType ("Suit") ("") ([$.String])
  (x => /^c|d|h|s$/.test (x))

//    Card :: Type
const Card = $.NamedRecordType ("Card") ("") ([])
  ({rank: Rank, suit: Suit, value: $.PositiveFiniteNumber})

module.exports = {
  def,
  CARD_RANKS,
  Card,
}
