const $ = require("sanctuary-def")
const S = require("sanctuary")
const Pair = require("sanctuary-pair")

const {
  def,
  Bet,
  Pots,
} = require("./types")

const combinePots = pots1 => pots2 => {
  if (!pots1 && !pots2) {return {}}
  if (!pots1 || !pots1.pots) {return pots2}
  if (!pots2 || !pots2.pots) {return pots1}

  return {
    pots: pots1.pots.concat(pots2.pots).reduce((acc, pot) => {
      const equalPlayers = p => S.equals(S.sort(p.players))(S.sort(pot.players))

      if (acc.find(equalPlayers)) {
        return acc.map(p => {
          if (equalPlayers(p)) {
            return {...p, amount: pot.amount + p.amount}
          }
          return p
        })
      }

      return acc.concat(pot)
    }, []),
    return: pots1.return.concat(pots2.return).reduce((acc, pot) => {
      if (acc.find(p => S.equals(p.playerId)(pot.playerId))) {
        return acc.map(p => {
          if (S.equals(pot.playerId)(p.playerId)) {
            return {...p, amount: pot.amount + p.amount}
          }
          return p
        })
      }

      return acc.concat(pot)
    }, [])
  }
}

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

const bet = bet => state => {
  const {bets, players} = state

  const updatedPlayers = S.map(p => {
    if (p.playerId === bet.playerId) {
      return {...p, stack: p.stack - bet.amount}
    }

    return p
  })(players)

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
    const reversedBets = [...bets].reverse()
    const b = bets.find(p => p.playerId === bet.playerId)
    const i = reversedBets.findIndex(p => p.playerId === bet.playerId)

    if (b.amount > reversedBets[(i + 1) % bets.length].amount) {
      return [bet.playerId]
    } else {
      return whoActed.concat(bet.playerId).reduce((acc, id) => {
        if (acc.indexOf(id) > -1) {return acc}
        return acc.concat(id)
      }, [])
    }
  }
  const whoActed = updateWhoActed(updatedBets)(state)
  const nextPlayer = (
    players.findIndex(p => p.playerId === whoActed[whoActed.length - 1]) + 1) % players.length

  const balanced =  updatedBets.length >= players.length
    && updatedBets.every((bet, _, bets) => bet.amount === bets[0].amount)

  const everyoneActed = whoActed.length === players.length
  const everyoneAllIn =
    S.filter(p => p.stack === 0)(updatedPlayers).length === updatedPlayers.length

  const someAllIn = S.filter(p => p.stack === 0)(updatedPlayers).length > 0

  const playersNotAllIn = S.filter(p => p.stack !== 0)(updatedPlayers)

  const betsNotAllIn = S.filter
    (b => S.map(p => p.playerId)(playersNotAllIn).indexOf(b.playerId) > -1)(updatedBets)

  const balancedAndSomeAllIn = someAllIn && betsNotAllIn.length > 1 &&
    betsNotAllIn.every((bet, _, bets) => bet.amount === bets[0].amount)

  if (everyoneAllIn || balancedAndSomeAllIn) {
    const result = {
      players: updatedPlayers,
      bets: [],
      pots: combinePots(state.pots)(calculatePots(updatedBets)),
    }

    return {
      ...state,
      ...result,
      nextPlayer,
      whoActed,
    }
  }

  const result = {
    players: updatedPlayers,
    bets: everyoneActed && balanced? [] : updatedBets,
    pots: everyoneActed && balanced?
      combinePots(state.pots)(calculatePots(updatedBets)) : (state.pots || {}),
  }

  return {
    ...state,
    ...result,
    nextPlayer,
    whoActed,
  }
}

const updateStack = bets => player => {
  const bet = bets.find(bet => bet.playerId === player.playerId)

  if (!bet) {return player}

  return {
    ...player,
    stack: player.stack - bet.amount,
  }
}

const postBlinds = state => {
  const {blinds, players, button} = state
  const getPlayersOnBlinds = players.length === 2?
    (_, i) => i === button || i === (button + 1) % players.length :
    (_, i) => i === (button + 1) % players.length || i === (button + 2) % players.length

  const bets = players
    .filter(getPlayersOnBlinds)
    .map((p, i) => ({playerId: p.playerId, amount: blinds[i]}))

  const result = {
    bets,
    players: players.map(updateStack(bets)),
  }

  return {
    ...state,
    ...result,
  }
}

module.exports = {calculatePots, postBlinds, bet}

