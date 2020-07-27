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
const {newCard, randomDeck} = require("./card")
const {selectWinningHands} = require("./hand")
const {postBlinds, fold, bet} = require("./bet")

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

//    leaveTable :: Player -> Game -> Game
const leaveTable = def("leaveTable")({})([Player.types.id, Game, Game])
  (playerId => game => {
    const {round, table} = fold(playerId)(game)

    return {
      round,
      table: {
        ...table,
        players: S.filter(p => p.id !== playerId)(table.players),
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
  (id => table => button => blinds => cards => deck => {
    const players = S.map(p => p.id)(table.players)
    const utg = players[players.length === 2? button : (button + 3) % players.length]

    return {
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
      utg,
      nextPlayer: utg,
      blinds,
      blindsPosted: false,
      bets: [],
      pots: {pots: [], return: []},
      players,
      winners: [],
    }
  })

const toMaybe = v => (v == null) || Object.keys(v).length === 0 ? S.Nothing : S.Just(v)

//    newRound :: Cards -> Game -> Game
const newRound = ({deck, id}) => ({table, round}) =>
  _newRound({table, round: S.Just(round), id: toMaybe(id), deck})

//    newRound :: Cards -> Game -> Game
const newFirstRound = ({deck, id}) => ({table}) =>
  _newRound({table, round: S.Nothing, id: toMaybe(id), deck})

//    newRound0 :: {Table, Maybe Round, Maybe Round.id, Cards} -> Game
const _newRound = def
  ("newRound")
  ({})
  ([
    $.RecordType({
      table: Table,
      round: $.Maybe(Round),
      id: $.Maybe(Round.types.id),
      deck: Cards}),
    Game])
  (({table, round, id, deck}) => {
    const newRoundId = S.fromMaybe(uuid.v4())(id)
    const [button, blinds] = S.maybe([-1, Pair(1)(2)])(r => [r.button, r.blinds])(round)

    return {
      table,
      round: newRoundExtended
        (newRoundId)
        (table)
        ((button + 1) % table.players.length)
        (blinds)
        ([])
        (deck),
    }
  })

//    deal :: Game -> Game
const deal = def("deal")({})([Game, Game])
  (({table, round}) => {
    const {street, streetStatus} = round
    const streetFinished = streetStatus === STREET_STATUS[1]
    const streetInProgress = streetStatus === STREET_STATUS[0]
    const allIn = round.status === ROUND_STATUS[2]

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
          streetStatus: allIn? STREET_STATUS[1] : STREET_STATUS[0],
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
          streetStatus: allIn? STREET_STATUS[1] : STREET_STATUS[0],
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

    if (round.players.length === 1) {
      return {
        ...round,
        street: STREETS[4],
        winners: [{
          playerId: round.players[0],
          amount: pots[0].amount,
          hand: S.Nothing,
        }],
      }
    }

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
      street: STREETS[4],
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
        players: S.filter(p => p.stack > 0)(S.map
          (p => {
            const winAmount = S.reduce
              (acc => w => acc + w.amount)
              (0)
              (S.filter(w => w.playerId === p.id)(winners))

              return {
                ...p,
                stack: p.stack + winAmount,
              }
          })
          (table.players))
      },
      round: {
        ...round,
        status: ROUND_STATUS[1],
        communityCards: [],
        cards: [],
        pots: {pots: [], return: []},
      },
    }
  })

const stateToActions = state => {
  const {table, round} = state
  const allIn = round.status === ROUND_STATUS[2]
  const roundInProgress = round.status === ROUND_STATUS[0] || allIn
  const roundFinished = round.status === ROUND_STATUS[1]
  const streetFinished = round.streetStatus === STREET_STATUS[1]
  const streetInProgress = round.streetStatus === STREET_STATUS[0]
  const isRiver = round.street === STREETS[3]
  const isShowdown = round.street === STREETS[4]
  const gotWinners = round.winners && round.winners.length > 0

  const canDeal = !isShowdown
    && (round.street === STREETS[0] && round.blindsPosted && round.deck.length === 52
    || allIn
    || streetFinished)

  let actions = {leave: leaveTable}

  if (table.players.length < table.maxPlayers) {
    actions.sitPlayer = sitPlayer
  }

  if (table.players.length >= 2 && roundFinished) {
    if (round.id) {
      actions.newRound = newRound
    } else {
      actions.newRound = newFirstRound
    }
  }

  if (roundInProgress) {
    if (!round.blindsPosted) {
      actions.postBlinds = postBlinds
    }

    if (canDeal) {
      actions.deal = deal
    }

    if (streetInProgress && round.blindsPosted && !canDeal && !allIn) {
      const next = round.nextPlayer
      actions.bet = amount => bet({playerId: next, amount})
      actions.fold = fold(next)
    }

    if (
      (round.players.length === 1)
      || (isShowdown && !gotWinners)
      || (allIn && isRiver && streetFinished)
    ) {
      actions.getWinners = computeRoundWinners
    }

    if (gotWinners) {
      actions.endRound = endRound
    }
  }

  return actions
}

const reducer = state => {
  const get = states => () => states[states.length - 1]
  const getAll = states => () => states

  const update = states => f => {
    const state = states[states.length - 1]
    const states2 = states.concat(f(stateToActions(state))(state))

    return {update: update(states2), getAll: getAll(states2), get: get(states2)}
  }

  return {update: update([state]), getAll: getAll([state]), get: get([state])}
}

//    newGame :: Table -> (Game -> Game) -> Game
const newGame = table => {
  const state = {
    table,
    round: {status: ROUND_STATUS[1]},
  }

  return reducer(state)
}

//    loadGame :: (JSON Game | Game) -> (Game -> Game) -> Game
const loadGame = ({table, round}) => {
  // serialized game object replaces Pair with object like {fst, snd}
  // this is a fix that creates Pairs when necessary
  const state = {
    table,
    round: {
      ...round,
      blinds: S.maybe
        (Pair(1)(2))
        (b => Pair(Pair.fst(b))(Pair.snd(b)))
        (toMaybe(round.blinds)),
      cards: S.maybe
        ([])
        (S.map(c => Pair(Pair.fst(c))(Pair.snd(c))))
        (toMaybe(round.cards)),
      winners: S.maybe
        ([])
        (S.map(w => ({...w, hand: toMaybe(w.hand.value)})))
        (toMaybe(round.winners)),
    },
  }

  return reducer(state)
}

module.exports = {
  newTable,
  sitPlayer,
  leaveTable,
  newRoundExtended,
  newRound,
  newFirstRound,
  deal,
  computeRoundWinners,
  _computeRoundWinners,
  endRound,
  newGame,
  loadGame,
}
