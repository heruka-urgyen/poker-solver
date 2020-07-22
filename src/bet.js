const $ = require("sanctuary-def")
const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const {
  def,
  Bet,
  Bets,
  Player,
  Pots,
  Game,
  Table,
  Round,
  STREETS,
  STREET_STATUS,
  ROUND_STATUS,
} = require("./types")

//    combinePots :: Pots -> Pots -> Pots
const combinePots = def("combinePots")({})([Pots, Pots, Pots])
  (pots1 => pots2 => {
    const reduce = pred => xs =>
      S.reduce(acc => pot => {
        if (acc.find(pred(pot))) {
          return S.map(p => {
            if (pred(pot)(p)) {
              return {...p, amount: pot.amount + p.amount}
            }
            return p
          })(acc)
        }

        return S.append(pot)(acc)
      })([])(xs)

    return {
      pots: reduce
        (pot => p => S.equals(S.sort(p.players))(S.sort(pot.players)))
        (S.concat(pots1.pots)(pots2.pots)),
      return: reduce
        (pot => p => S.equals(p.playerId)(pot.playerId))
        (S.concat(pots1.return)(pots2.return)),
    }
  })

//    calculatePots :: [Bet] -> Pots
const calculatePots = def("calculatePots")({})([$.Array(Bet), Pots])
  (bets => S.reduce
    (acc => pot => {
      if (pot.players.length === 0) {
        return acc
      }

      if (pot.players.length > 1) {
        return {...acc, pots: S.append(pot)(acc.pots)}
      }

      return {...acc, return: [{playerId: pot.players[0], amount: pot.amount}]}
    })
    ({pots: [], return: []})
    (S.map
      (({amount, bets}) => ({amount, players: S.map(b => b.playerId)(bets)}))
      (S.reduce
        (acc => bet => {
          if (acc[0].bets.length === 0) {
            const m = Math.min.apply([], S.map(b => b.amount)(bets))
            return [{bets, m, amount: m * bets.length}]
          }

          const a = S.maybe({bets: [], m: 0})(({bets, m}) => ({bets, m}))(S.last(acc))
          const bets2 = S.filter
            (b => b.amount > 0)
            (S.map(b => ({...b, amount: b.amount - a.m}))(a.bets))
          const m = Math.min.apply([], S.map(b => b.amount)(bets2))

          if (bets2.length === 0) {
            return acc
          }

          return S.append({bets: bets2, m, amount: m * bets2.length})(acc)
        })
        ([{bets: [], m: 0, amount: 0}])
        (bets))))


//    getNextPlayer :: Game -> (Player.id -> Player.id)
const getNextPlayer = def
  ("getNextPlayer")
  ({})
  ([Game, $.Fn(Player.types.id)(Player.types.id)])
  (({round, table}) => {
    const ps = S.filter(p => round.players.indexOf(p.id) > -1)(table.players)

    const inner = pid => {
      const pi = ps.findIndex(p => p.id === pid)

      if (ps.length === 1 || ps[pi].stack > 0) {
        return ps[pi].id
      }

      if (S.filter(p => p.stack > 0)(ps).length === 0) {
        return S.maybe(ps[0].id)(p => p.id)(S.find(p => p.id === round.utg)(ps))
      }


      return inner(ps[(pi + 1) % ps.length].id)
    }

    return inner
  })

//    returnExtraBets :: Pots -> [Player] -> [Player]
const returnExtraBets = def("getNextPlayer")({})([Pots, $.Array(Player), $.Array(Player)])
  (pots => players = S.map(p => {
    const isReturnPlayer = S.maybe
      (false)
      (id => id === p.id)
      (S.get
        (S.is($.String))
        ("playerId")
        (pots.return[0]))

    const returnAmount = isReturnPlayer? S.fromMaybe
      (0)
      (S.get
        (S.is($.Number))
        ("amount")
        (pots.return[0])) : 0

    return {
      ...p,
      stack: p.stack + returnAmount,
    }
  }))

//    bet :: Bet -> Game -> Game
const bet = def("bet")({})([Bet, Game, Game])
  (bet => state => {
    const {table, round} = state
    const {bets, players} = round

    const updatedPlayers = S.map(p => {
      if (p.id === bet.playerId) {
        return {...p, stack: p.stack - bet.amount}
      }

      return p
    })(table.players)

    const updatedBets = S.reduce
      (acc => bet => {
        if (S.filter(b => b.playerId === bet.playerId)(acc).length > 0) {
          return S.map(b => {
            if (b.playerId === bet.playerId) {
              return {
                ...b,
                amount: b.amount + bet.amount,
              }
            }

            return b
          })(acc)
        }

        return S.append(bet)(acc)
      })
      ([])
      (S.append(bet)(bets))

    const updateWhoActed = players => bets => ({whoActed = []}) => {
      const i = bets.findIndex(b => b.playerId === bet.playerId)
      const maybeAllInPlayer = S.find(p => p.stack === 0)(players)
      const hasAllInPlayer = S.isJust(S.find(p => p.stack === 0)(players))
      const allInPlayerId = S.maybe("")(p => p.id)(maybeAllInPlayer)
      const removeDuplicates = xs => S.reduce
        (acc => id => acc.indexOf(id) > -1? acc : S.append(id)(acc))([])(xs)

      if (bets[i].amount > bets[i > 0? i - 1 : bets.length - i - 1].amount) {
        return hasAllInPlayer?
          removeDuplicates([allInPlayerId, bet.playerId]) :
          [bet.playerId]
      } else {
        const updatedWhoActed = removeDuplicates(S.append(bet.playerId)(whoActed))
        return hasAllInPlayer?
          removeDuplicates(S.append(allInPlayerId)(updatedWhoActed)) :
          updatedWhoActed
      }
    }

    const playersAllIn = S.filter(p => p.stack === 0)(updatedPlayers)
    const playersNotAllIn = S.filter(p => p.stack !== 0)(updatedPlayers)
    const everyoneAllIn = playersAllIn.length === players.length
    const whoActed = updateWhoActed(updatedPlayers)(updatedBets)(round)
    const endOfStreet = whoActed.length === players.length || everyoneAllIn

    if (endOfStreet) {
      const allIn = round.players.length - playersAllIn.length <= 1
      const pots = combinePots(round.pots)(calculatePots(updatedBets))

      const updatedTable = {...table, players: returnExtraBets(pots)(updatedPlayers)}
      const updatedRound = {
        ...round,
        bets: [],
        nextPlayer: getNextPlayer({round, table})(round.utg),
        pots: {
          pots: pots.pots,
          return: [],
        },
        status: allIn? ROUND_STATUS[2] : round.status,
        street: round.street === STREETS[3]? STREETS[4] : round.street,
        streetStatus: STREET_STATUS[1],
        whoActed: [],
      }

      return {
        table: updatedTable,
        round: updatedRound,
      }
    }

    const updatedTable = {...table, players: updatedPlayers}
    const nextPlayer = players[(players.indexOf(bet.playerId) + 1) % players.length]
    const updatedRound = {
      ...round,
      bets: updatedBets,
      nextPlayer,
      whoActed,
    }

    return {
      table: updatedTable,
      round: updatedRound,
    }
  })

//    fold :: Player.id -> Game -> Game
const fold = def("fold")({})([Player.types.id, Game, Game])
  (id => ({table, round}) => {
    const {players, whoActed = []} = round
    const updatedPlayers = S.filter(pid => pid !== id)(players)
    const everyoneActed = whoActed.length >= updatedPlayers.length
    const nextPlayer = players[(players.indexOf(id) + 1) % players.length]

    const sumAmounts = x => y => x + y.amount
    const potSum = S.reduce(sumAmounts)(0)(round.pots.pots)
    const potBetSum = S.reduce(sumAmounts)(potSum)(round.bets)

    const betByFolder = S.fromMaybe({amount: 0})(S.find(b => b.playerId === id)(round.bets))
    const playersNotAllIn = S.filter
      (p => updatedPlayers.indexOf(p.id) > -1 && p.stack > 0)
      (table.players)

    const allIn = playersNotAllIn.length <= 1
    const roundStatus = allIn? ROUND_STATUS[2] : round.status

    const updatePots = pots => ({
      return: pots.return,
      pots: S.map(p => {
        if (S.equals(S.sort(p.players))(S.sort(players))) {
          return {...p, players: updatedPlayers}
        }

        return p
      })(S.filter(p => p.amount > 0)(pots.pots))
    })

    const updatedPots = combinePots
      (updatePots(round.pots))
      (updatePots(calculatePots(round.bets)))

    if (everyoneActed || players.length === 2) {
      return {
        table: {
          ...table,
          players: returnExtraBets(updatedPots)(table.players)
        },
        round: {
          ...round,
          bets: [],
          nextPlayer,
          players: updatedPlayers,
          pots: {
            pots: updatedPots.pots,
            return: []},
          status: roundStatus,
          streetStatus: STREET_STATUS[1],
        },
      }
    }

    return {
      table,
      round: {
        ...round,
        bets: S.filter(b => b.playerId !== id)(round.bets),
        nextPlayer,
        players: updatedPlayers,
        pots: updatePots(combinePots
          ({pots: [{players: updatedPlayers, amount: betByFolder.amount}], return: []})
          (round.pots)),
        status: roundStatus,
      }
    }
  })

//    postBlinds :: Game -> Game
const postBlinds = def("postBlinds")({})([Game, Game])
  (({table, round}) => {
    const {players, blinds, button, blindsPosted} = round

    if (blindsPosted) {
      return {table, round}
    }

    const playersOnBlinds = S.map
      (i => table.players.find(p => p.id === players[i % players.length]))
      (players.length === 2? [button, button + 1] : [button + 1, button + 2])

    const bets = S.bimap
      (amount => ({playerId: playersOnBlinds[0].id, amount}))
      (amount => ({playerId: playersOnBlinds[1].id, amount}))
      (blinds)

    const game = S.map
      (({table, round}) => ({
          table,
          round: {...round, blindsPosted: true, whoActed: []},
        }))
      (S.reduce
        (game => b => [bet(b)(game[0])])
        ([{round, table}])
        ([Pair.fst(bets), Pair.snd(bets)]))

    return game[0]
  })

module.exports = {calculatePots, postBlinds, bet, fold}

