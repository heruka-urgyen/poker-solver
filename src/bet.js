const $ = require("sanctuary-def")
const S = require("sanctuary")

const {
  def,
  Bet,
  Pots,
} = require("./types")

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

const bet = ({players, bets, bet}) => {
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

  const balanced =  updatedBets.length >= players.length
    && updatedBets.every((bet, _, bets) => bet.amount === bets[0].amount)

  const everyoneAllIn =
    S.filter(p => p.stack === 0)(updatedPlayers).length === updatedPlayers.length

  const playersNotAllIn = S.filter(p => p.stack !== 0)(updatedPlayers)

  const betsNotAllIn = S.filter
    (b => S.map(p => p.playerId)(playersNotAllIn).indexOf(b.playerId) > -1)(updatedBets)

  const balancedAndSomeAllIn = betsNotAllIn.length > 1 &&
    betsNotAllIn.every((bet, _, bets) => bet.amount === bets[0].amount)

  if (everyoneAllIn || balancedAndSomeAllIn) {
    return {
      balanced: true,
      players: updatedPlayers,
      bets: [],
      pots: calculatePots(updatedBets),
    }
  }

  return {
    balanced,
    players: updatedPlayers,
    bets: balanced? [] : updatedBets,
    pots: balanced? calculatePots(updatedBets) : {},
  }
}

module.exports = {calculatePots, bet}
