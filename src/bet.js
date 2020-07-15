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
      const reversedBets = S.reverse(bets)
      const b = bets.find(b => b.playerId === bet.playerId)
      const i = reversedBets.findIndex(b => b.playerId === bet.playerId)
      const maybeAllInPlayer = S.find(p => p.stack === 0)(players)
      const hasAllInPlayer = S.isJust(S.find(p => p.stack === 0)(players))
      const allInPlayer = S.maybe("")(p => p.id)(maybeAllInPlayer)
      const removeDuplicates = xs => S.reduce
        (acc => id => acc.indexOf(id) > -1? acc : S.append(id)(acc))([])(xs)

      if (b.amount > reversedBets[(i + 1) % bets.length].amount) {
        return hasAllInPlayer? removeDuplicates([allInPlayer, bet.playerId]) : [bet.playerId]
      } else {
        return removeDuplicates(S.append(bet.playerId)(whoActed))
      }
    }

    const whoActed = updateWhoActed(updatedPlayers)(updatedBets)(round)

    const nextPlayer = players[(
      players.findIndex(id => id === whoActed[whoActed.length - 1]) + 1) % players.length]

    const playersAllIn = S.filter(p => p.stack === 0)(updatedPlayers)
    const playersNotAllIn = S.filter(p => p.stack !== 0)(updatedPlayers)
    const someAllIn = playersAllIn.length > 0
    const everyoneAllIn = playersAllIn.length === players.length

    const everyoneActed = whoActed.length === players.length || everyoneAllIn

    const betsNotAllIn = S.filter
      (b => playersNotAllIn.findIndex(p => p.id === b.playerId) > -1)(updatedBets)

    const endOfStreet = everyoneActed && (everyoneActed || someAllIn)

    if (endOfStreet) {
      const allIn = everyoneAllIn || someAllIn && updatedPlayers.length === 2
      const pots = combinePots(round.pots)(calculatePots(updatedBets))
      const players = S.map(p => {
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
      })(updatedPlayers)

      const updatedTable = {...table, players}
      const updatedRound = {
        ...round,
        status: allIn? ROUND_STATUS[2] : round.status,
        bets: [],
        pots: {
          pots: pots.pots,
          return: [],
        },
        nextPlayer: round.utg,
        whoActed: [],
        streetStatus: STREET_STATUS[1],
        street: round.street === STREETS[3]? STREETS[4] : round.street
      }

      return {
        table: updatedTable,
        round: updatedRound,
      }
    }

    const updatedTable = {...table, players: updatedPlayers}
    const updatedRound = {
      ...round,
      bets: updatedBets,
      pots: round.pots,
      nextPlayer,
      whoActed: whoActed,
      street: round.street,
    }

    return {
      table: updatedTable,
      round: updatedRound,
    }
  })

//    updateStack :: [Bet] -> Player -> Player
const updateStack = def("updateStack")({})([$.Array(Bet), Player, Player])
  (bets => player =>
    S.maybe
      (player)
      (bet => ({...player, stack: player.stack - bet.amount}))
      (S.find(bet => bet.playerId === player.id)(bets)))

//    postBlinds :: Game -> Game
const postBlinds = def("postBlinds")({})([Game, Game])
  (({table, round}) => {
    const {players} = table
    const {blinds, button, blindsPosted} = round
    const getPlayersOnBlinds = players.length === 2?
      (_, i) => i === button || i === (button + 1) % players.length :
      (_, i) => i === (button + 1) % players.length || i === (button + 2) % players.length

    if (blindsPosted) {
      return {table, round}
    }

    const bets = players
      .filter(getPlayersOnBlinds)
      .map((p, i) => ({playerId: p.id, amount: [Pair.fst(blinds), Pair.snd(blinds)][i]}))

    const updatedTable = {
      ...table,
      players: S.map(updateStack(bets))(players),
    }

    const updatedRound = {
      ...round,
      bets,
      blindsPosted: true,
    }

    return {
      table: updatedTable,
      round: updatedRound,
    }
  })

//    fold :: Player.id -> Game -> Game
const fold = def("fold")({})([Player.types.id, Game, Game])
  (id => ({table, round}) => {
    const {players} = table
    const pots = S.reduce(acc => pot => acc + pot.amount)(0)(round.pots.pots)
    const pot = S.reduce(acc => bet => acc + bet.amount)(pots)(round.bets)
    const roundPlayers = S.filter(pid => pid !== id)(round.players)

    if (players.length === 2) {
      return {
        table,
        round: {
          ...round,
          players: roundPlayers,
          bets: [],
          pots: {
            pots: [{players: round.players, amount: pot}],
            return: [],
          },
          winners: [{
            playerId: roundPlayers[0],
            amount: pot,
            hand: S.Just({
              cards: S.map
                (S.extract)(S.filter(c => Pair.fst(c) === roundPlayers[0].id)(round.cards)),
              rank: "High Card",}),
          }],
        },
      }
    } else {
      const bet = round.bets.find(b => b.playerId === id)

      if (roundPlayers.length === round.whoActed.length) {
        return {
          table,
          round: {
            ...round,
            streetStatus: STREET_STATUS[1],
            players: roundPlayers,
            bets: [],
            pots: {
              pots: [{players: roundPlayers, amount: pot}],
              return: [],
            },
          },
        }
      }

      return {
        table,
        round: {
          ...round,
          players: roundPlayers,
          bets: round.bets.filter(b => b.playerId !== id),
          pots: {
            pots: [{players: roundPlayers, amount: bet.amount}],
            return: [],
          },
        },
      }
    }
  })

module.exports = {calculatePots, postBlinds, bet, fold}

