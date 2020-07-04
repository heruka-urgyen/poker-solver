const S = require("sanctuary")
const $ = require("sanctuary-def")

const env = $.env;
const def = $.create({checkTypes: true, env})

const CARD_SUITS = ["c", "d", "h", "s"]
const CARD_RANKS =  ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
const HAND_RANKS =  [
  "High Card",
  "Pair",
  "Two Pair",
  "Trips",
  "Straight",
  "Flush",
  "Full House",
  "Quads",
  "Straight Flush",
]
const STREETS = ["PREFLOP", "FLOP", "TURN", "RIVER"]

//    Rank :: Type
const Rank = $.NullaryType("Rank")("")([$.String])
  (x => CARD_RANKS.indexOf(x) > -1)

//    Suit :: Type
const Suit = $.NullaryType("Suit")("")([$.String])
  (x => CARD_SUITS.indexOf(x) > -1)

//    Card :: Type
const Card = $.NamedRecordType("Card")("")([])
  ({rank: Rank, suit: Suit, value: $.PositiveFiniteNumber})

const Cards = $.Array(Card)

//    HandRank :: Type
const HandRank = $.NullaryType("HandRank")("")([$.String])
  (x => HAND_RANKS.indexOf(x) > -1)

//    Hand :: Type
const Hand = $.NamedRecordType("Hand")("")([])
  ({cards: Cards, rank: HandRank})

//    Player :: Type
const Player = $.NamedRecordType("Player")("")([])
  ({id: $.String})

//    Table :: Type
const Table = $.NamedRecordType("Table")("")([])
  ({
    id: $.PositiveInteger,
    maxPlayers: $.PositiveInteger,
    players: $.Array(Player),
    button: $.Integer,
  })

//    Round :: Type
const Round = $.NamedRecordType("Round")("")([])
  ({
    id: $.PositiveInteger,
    table: Table,
    deck: Cards,
    communityCards: Cards,
    cards: $.Array($.Pair($.String)(Cards)),
    winners: $.Array($.Object),
  })

//    Street :: Type
const Street = $.NullaryType("Street")("")([$.String])
  (x => STREETS.indexOf(x) > -1)

//    Bet :: Type
const Bet = $.NamedRecordType("Bet")("")([])
  ({
    playerId: Player.types.id,
    amount: $.NonNegativeInteger,
  })

//    Pot :: Type
const Pot = $.NamedRecordType("Pot")("")([])
  ({
    players: $.Array(Player.types.id),
    amount: $.NonNegativeInteger,
  })

//    Pots :: Type
const Pots = $.NamedRecordType("Pots")("")([])
  ({
    pots: $.Array(Pot),
    return: $.Array(Bet),
  })

module.exports = {
  def,
  CARD_RANKS,
  Card,
  Cards,
  CARD_SUITS,
  HAND_RANKS,
  Hand,
  Player,
  Table,
  Round,
  Street,
  STREETS,
  Bet,
  Pots,
}
