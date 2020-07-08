const $ = require("sanctuary-def")
const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const {
  def,
  CARD_SUITS,
  CARD_RANKS,
  Table,
  Player,
  Cards,
  Hand,
  Round,
  Street,
  STREETS,
  Game,
} = require("./types")
const {newCard, newDeck} = require("./card")
const {selectWinningHands} = require("./hand")

//    newTable :: Int -> Int -> Table
const newTable = def("newTable")({})([$.PositiveInteger, $.PositiveInteger, Table])
  (id => maxPlayers => ({
    id,
    maxPlayers,
    players: [],
  }))

//    sitPlayer :: Table -> Player -> Table
const sitPlayer = def("sitPlayer")({})([Table, Player, Table])
  (table => player => ({
    ...table,
    ...(t => p => {
      const newPlayers = S.append(p)(t.players)

      if (newPlayers.length > t.maxPlayers) {
        return {players: t.players}
      }

      return {players: newPlayers}
    })(table)(player),
  }))

//    Blinds = Pair Positive Int, Positive Int
//    Hole Cards = [Pair Player.id [Card]]
//    newRoundExtended :: Int -> Table -> Int -> Blinds -> Hole Cards -> [Card] -> Round
const newRoundExtended = def("newRoundExtended")({})
  ([
    Round.types.id,
    Table,
    Round.types.button,
    Round.types.blinds,
    $.Array($.Pair(Player.types.id)(Cards)),
    Cards,
    Round,
  ])
  (id => table => button => blinds => cards => deck => ({
    id,
    tableId: table.id,
    deck: S.filter(c => !S.elem(c)(S.chain(S.extract)(cards)))(deck),
    communityCards: [],
    cards: S.map
      (p => S.fromMaybe(S.Pair(p.id)([]))(S.find(c => Pair.fst(c) === p.id)(cards)))
      (table.players),
    button,
    blinds,
    bets: [],
    pots: {pots: [], return: []},
    players: S.map(p => p.id)(table.players),
    winners: [],
  }))

//    Blinds = Pair Positive Int, Positive Int
//    newRound :: Int -> Table -> Int -> Blinds -> Round
const newRound = def("newRound")({})
  ([
    Round.types.id,
    Table,
    Round.types.button,
    Round.types.blinds,
    Round,
  ])
  (a => b => c => d => newRoundExtended(a)(b)(c)(d)([])(newDeck("shuffle")))

//    deal :: Street -> Round -> Round
const deal = def("deal")({})([Street, Round, Round])
  (street => round => {
    if (street === STREETS[0]) {
      const {players, button} = round
      const {deck} = round

      const cards = S.map
        (c => S.map
          (x => x.length === 2? x : [
            deck[(Pair.fst(c) + button + 1) % (players.length)],
            deck[(Pair.fst(c) + button + 1) % (players.length) + players.length]])
          (Pair.snd(c)))
        (S.map(c => Pair(round.cards.indexOf(c))(c))(round.cards))

      return {
        ...round,
        deck: deck.slice(players.length * 2),
        cards,
      }
    }

    if (street === STREETS[1]) {
      const {deck} = round

      return {
        ...round,
        deck: deck.slice(3),
        communityCards: deck.slice(0, 3),
      }
    }

    if (street === STREETS[2] || street === STREETS[3]) {
      const {deck, communityCards} = round

      return {
        ...round,
        deck: deck.slice(1),
        communityCards: S.append(deck[0])(communityCards),
      }
    }
  })

//    computeRoundWinners :: Round -> Round
const computeRoundWinners = def("computeRoundWinners")({})([Round, Round])
  (round => ({
    ...round,
    winners: selectWinningHands(S.map(S.map(S.concat(round.communityCards)))(round.cards))
  }))

//    playRound :: Round -> Round
const playRound = def("playRound")({})([Round, Round])
  (r => {
    const r1 = deal(STREETS[0])(r)
    const r2 = deal(STREETS[1])(r1)
    const r3 = deal(STREETS[2])(r2)
    const r4 = deal(STREETS[3])(r3)

    return computeRoundWinners(r4)
  })

//    newGame :: Game -> Game
const newGame = def("newGame")({})([Game, $.AnyFunction])
  (game => {
    let _state = game

    return f => {
      const newState = f(_state)
      _state = newState

      return _state
    }
  })

module.exports = {
  newTable,
  sitPlayer,
  newRoundExtended,
  newRound,
  deal,
  computeRoundWinners,
  playRound,
  newGame,
}
