import { PlayerStats } from './stats'
export type Match = {
    matchId: string
    league: string
    homeTeamId: string
    awayTeamId: string
    date: string
    stats: MatchStats
}
export type MatchStats = {
    homeTeamStats: TeamMatchStats|null
    awayTeamStats?: TeamMatchStats|null
}

export type TeamMatchStats = {
        shots: number
        goals: number
        playerStats: PlayerStats[]
    }