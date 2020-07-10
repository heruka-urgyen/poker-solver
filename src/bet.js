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

    const updateWhoActed = bets => ({whoActed = []}) => {
      const reversedBets = S.reverse(bets)
      const b = bets.find(b => b.playerId === bet.playerId)
      const i = reversedBets.findIndex(b => b.playerId === bet.playerId)

      if (b.amount > reversedBets[(i + 1) % bets.length].amount) {
        return [bet.playerId]
      } else {
        return S.reduce(acc => id => {
          if (acc.indexOf(id) > -1) {return acc}
          return S.append(id)(acc)
        })([])(S.append(bet.playerId)(whoActed))
      }
    }

    const whoActed = updateWhoActed(updatedBets)(round)
    const nextPlayer = (
      players.findIndex(id => id === whoActed[whoActed.length - 1]) + 1) % players.length

    const balanced =  updatedBets.length >= players.length
      && updatedBets.every((bet, _, bets) => bet.amount === bets[0].amount)

    const everyoneActed = whoActed.length === players.length
    const everyoneAllIn =
      S.filter(p => p.stack === 0)(updatedPlayers).length === updatedPlayers.length

    const someAllIn = S.filter(p => p.stack === 0)(updatedPlayers).length > 0

    const playersNotAllIn = S.filter(p => p.stack !== 0)(updatedPlayers)

    const betsNotAllIn = S.filter
      (b => S.map(p => p.id)(playersNotAllIn).indexOf(b.playerId) > -1)(updatedBets)

    const balancedAndSomeAllIn = someAllIn && betsNotAllIn.length > 1 &&
      betsNotAllIn.every((bet, _, bets) => bet.amount === bets[0].amount)

    const updatedTable = {
      ...table,
      players: updatedPlayers,
    }

    if (everyoneAllIn || balancedAndSomeAllIn) {
      const updatedRound = {
        ...round,
        status: everyoneAllIn? ROUND_STATUS[2] : round.status,
        bets: [],
        pots: combinePots(round.pots)(calculatePots(updatedBets)),
        nextPlayer,
        whoActed: [],
        street: STREETS[STREETS.indexOf(round.street) + 1],
      }

      return {
        table: updatedTable,
        round: updatedRound,
      }
    }

    const endOfStreet = everyoneActed && balanced
    const updatedRound = {
      ...round,
      bets: endOfStreet? [] : updatedBets,
      pots: endOfStreet?
        combinePots(round.pots)(calculatePots(updatedBets)) : round.pots,
      nextPlayer,
      whoActed: endOfStreet? [] : whoActed,
      street: endOfStreet? STREETS[STREETS.indexOf(round.street) + 1] : round.street,
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
      (S.find(bet => bet.playerId === player.id)(bets))
  )


//    postBlinds :: Game -> Game
const postBlinds = def("postBlinds")({})([Game, Game])
  (({table, round}) => {
    const {players} = table
    const {blinds, button} = round
    const getPlayersOnBlinds = players.length === 2?
      (_, i) => i === button || i === (button + 1) % players.length :
      (_, i) => i === (button + 1) % players.length || i === (button + 2) % players.length

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
    const pot = S.reduce(acc => bet => acc + bet.amount)(0)(round.bets)
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
            cards: S.map
              (S.extract)(S.filter(c => Pair.fst(c) === roundPlayers[0].id)(round.cards)),
            rank: "High Card",
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

