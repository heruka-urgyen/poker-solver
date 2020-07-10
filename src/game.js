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
  ROUND_STATUS,
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
    status: ROUND_STATUS[0],
    street: STREETS[0],
    tableId: table.id,
    deck: S.filter(c => !S.elem(c)(S.chain(S.extract)(cards)))(deck),
    communityCards: [],
    cards: S.map
      (p => S.fromMaybe(S.Pair(p.id)([]))(S.find(c => Pair.fst(c) === p.id)(cards)))
      (table.players),
    button,
    nextPlayer: button,
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

//    deal :: Round -> Round
const deal = def("deal")({})([Round, Round])
  (round => {
    const {street} = round
    if (street === STREETS[0]) {
      const {players, button} = round
      const {deck} = round
      const holeCards = round.cards.length === 0?
        round.players.map(id => Pair(id)([])) :
        round.cards

      const cards = S.map
        (c => S.map
          (x => x.length === 2? x : [
            deck[(Pair.fst(c) + button + 1) % (players.length)],
            deck[(Pair.fst(c) + button + 1) % (players.length) + players.length]])
          (Pair.snd(c)))
        (S.map(c => Pair(holeCards.indexOf(c))(c))(holeCards))

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
  (round => {
    const pots = S.reduce
      (acc => dummyPot => acc.length > 0? acc : [dummyPot])
      (round.pots.pots)
      ([{amount: 0, players: round.players}])

    const winners = S.chain
      (([pot, cards]) => {
        const winners =
          selectWinningHands(S.map(S.map(S.concat(round.communityCards)))(cards))

        return S.map
          (h => ({...h, amount: pot.amount / winners.length}))
          (winners)
      })
      (S.map
        (p => [p, S.map(id => round.cards.find(c => Pair.fst(c) === id))(p.players)])
        (pots))

    return {
      ...round,
      winners,
    }
  })

//    endRound :: Game -> Game
const endRound = def("endRound")({})([Game, Game])
  (({table, round}) => {
    const {winners} = round

    return {
      table: {
        ...table,
        players: S.map
          (p => {
            const maybeWinner = S.find(w => w.playerId === p.id)(winners)
            const winAmount = S.fromMaybe
              (0)
              (S.chain
                (S.get(S.is($.Number))("amount"))(maybeWinner))

            const isReturnPlayer = S.maybe
              (false)
              (id => id === p.id)
              (S.get
                (S.is($.String))
                ("playerId")
                (round.pots.return[0]))

            const returnAmount = isReturnPlayer? S.fromMaybe
              (0)
              (S.get
                (S.is($.Number))
                ("amount")
                (round.pots.return[0])) : 0

            if (S.isJust(maybeWinner)) {
              return {
                ...p,
                stack: p.stack + winAmount + returnAmount,
              }
            }

            return {
              ...p,
              stack: p.stack + returnAmount,
            }
          })
          (table.players)
      },
      round: {
        ...round,
        status: ROUND_STATUS[1],
      },
    }
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
  endRound,
  newGame,
}
