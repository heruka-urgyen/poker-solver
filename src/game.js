const $ = require("sanctuary-def")
const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const uuid = require("uuid")

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
  STREET_STATUS,
  ROUND_STATUS,
  Game,
} = require("./types")
const {newCard, newDeck} = require("./card")
const {selectWinningHands} = require("./hand")

//    newTable :: Int -> Int -> Table
const newTable = def("newTable")({})([Table.types.id, Table.types.maxPlayers, Table])
  (id => maxPlayers => ({
    id,
    maxPlayers,
    players: [],
  }))

const updatePlayers = t => p => {
  const newPlayers = S.append(p)(t.players)

  if (newPlayers.length > t.maxPlayers) {
    return t.players
  }

  return newPlayers
}

//    sitPlayer :: Player -> {Table, Round} -> {Table, Round}
const sitPlayer = def
  ("sitPlayer")
  ({})
  ([
    Player,
    $.RecordType({table: Table, round: $.Object}),
    $.RecordType({table: Table, round: $.Object}),
  ])
  (player => ({table, round}) => {
    const updatedPlayers = updatePlayers(table)(player)

    return {
      round,
      table: {
        ...table,
        players: updatedPlayers,
      },
    }
  })

//    leavePlayer :: Player -> Game -> Game
const leavePlayer = def("leavePlayer")({})([Player.types.id, Game, Game])
  (playerId => ({table, round}) => {
    const updatedPlayers = S.filter(p => p.id !== playerId)(table.players)
    const maybeBet = S.find(b => b.playerId === playerId)(round.bets)
    const updatedBets = S.filter(b => b.playerId !== playerId)(round.bets)
    const updatedPots = round.pots.pots.length > 0? S.map
      (pots => {
        return S.map(({players, amount}) => {
          const updatedPotPlayers =  S.filter(id => id !== playerId)(players)

          if (players.length === round.players.length) {
            return {
              players: updatedPotPlayers,
              amount: S.maybe(amount)(b => amount + b.amount)(maybeBet),
            }
          }

          return {players: updatedPotPlayers, amount}
        })(pots)
      })(round.pots) :
      {
        return: [],
        pots: [{
          players: S.map(p => p.id)(updatedPlayers),
          amount: S.maybe(0)(b => b.amount)(maybeBet)}]}

      return {
        table: {
          ...table,
          players: updatedPlayers,
        },
        round: {
          ...round,
          players: S.map(p => p.id)(updatedPlayers),
          bets: updatedBets,
          pots: updatedPots,
        },
      }
  })

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
    streetStatus: STREET_STATUS[0],
    tableId: table.id,
    deck: S.filter(c => !S.elem(c)(S.chain(S.extract)(cards)))(deck),
    communityCards: [],
    cards: S.map
      (p => S.fromMaybe(S.Pair(p.id)([]))(S.find(c => Pair.fst(c) === p.id)(cards)))
      (table.players),
    button,
    nextPlayer: table.players.length === 2? button : (button + 3) % table.players.length,
    blinds,
    blindsPosted: false,
    bets: [],
    pots: {pots: [], return: []},
    players: S.map(p => p.id)(table.players),
    winners: [],
  }))

//    newRound :: Game -> Game
const newRound = ({table, round}) => _newRound({table, round: S.Just(round)})

//    newRound :: Game -> Game
const newFirstRound = ({table}) => _newRound({table, round: S.Nothing})

//    newRound0 :: {Table, Maybe Round} -> Game
const _newRound = def
  ("newRound")
  ({})
  ([$.RecordType({table: Table, round: $.Maybe(Round)}), Game])
  (({table, round}) => {
    const newRoundId = uuid.v4
    const [button, blinds] = S.maybe([-1, Pair(1)(2)])(r => [r.button, r.blinds])(round)

    return {
      table,
      round: newRoundExtended
        (newRoundId())
        (table)
        ((button + 1) % table.players.length)
        (blinds)
        ([])
        (newDeck("shuffle")),
    }
  })

//    deal :: Game -> Game
const deal = def("deal")({})([Game, Game])
  (({table, round}) => {
    const {street, streetStatus} = round
    const streetFinished = streetStatus === STREET_STATUS[1]
    const streetInProgress = streetStatus === STREET_STATUS[0]

    if (street === STREETS[0] && streetInProgress) {
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
        table,
        round: {
          ...round,
          deck: deck.slice(players.length * 2),
          cards,
        },
      }
    }

    if (street === STREETS[0] && streetFinished) {
      const {deck} = round

      return {
        table,
        round: {
          ...round,
          deck: deck.slice(3),
          communityCards: deck.slice(0, 3),
          street: STREETS[1],
          streetStatus: STREET_STATUS[0],
        },
      }
    }

    if (streetFinished && (street === STREETS[1] || street === STREETS[2])) {
      const {deck, communityCards} = round

      return {
        table,
        round: {
          ...round,
          deck: deck.slice(1),
          communityCards: S.append(deck[0])(communityCards),
          street: STREETS[STREETS.indexOf(street) + 1],
          streetStatus: STREET_STATUS[0],
        },
      }
    }

    return {table, round}
  })

const computeRoundWinners = ({round, table}) => ({
  table,
  round: _computeRoundWinners(round),
})

//    _computeRoundWinners :: Round -> Round
const _computeRoundWinners = def("computeRoundWinners")({})([Round, Round])
  (round => {
    const pots = S.reduce
      (acc => dummyPot => acc.length > 0? acc : [dummyPot])
      (round.pots.pots)
      ([{amount: 0, players: round.players}])

    const winners = S.chain
      (([pot, cards]) => {
        const winners =
          selectWinningHands(S.map(S.map(S.concat(round.communityCards)))(cards))

        return S.map(h => ({...h, amount: pot.amount / winners.length}))(winners)
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

            if (S.isJust(maybeWinner)) {
              return {
                ...p,
                stack: p.stack + winAmount,
              }
            }

            return p
          })
          (table.players)
      },
      round: {
        ...round,
        status: ROUND_STATUS[1],
        communityCards: [],
        cards: [],
      },
    }
  })

//    newGame :: Table -> (Game -> Game) -> Game
const newGame = def("newGame")({})([Table, $.AnyFunction])
  (table => {
    let _state = {
      table,
      round: {},
    }

    return f => {
      const newState = f(_state)
      _state = newState

      return _state
    }
  })

module.exports = {
  newTable,
  sitPlayer,
  leavePlayer,
  newRoundExtended,
  newRound,
  newFirstRound,
  deal,
  computeRoundWinners,
  _computeRoundWinners,
  endRound,
  newGame,
}
