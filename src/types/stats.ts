export type PlayerStats = {
    playerId: string
    goals: number
    assists: number
    points: number
    shots: number
    gamesPlayed?: number
    saves: number
    plusMinus?: number
}
export type TeamStats = {
    teamId: string
    league: string
    shots: number
    wins: number
    losses: number
    overtimeLosses: number
    ties: number
    goalsFor: number
    goalsAgainst: number
}