import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const standingsQuerySchema = z.object({
  season_id: z.string().uuid('Invalid season ID'),
  league_id: z.string().uuid('Invalid league ID').optional(),
});

interface TeamStanding {
  team_id: string;
  team_name: string;
  team_abbreviation: string;
  games_played: number;
  wins: number;
  losses: number;
  overtime_losses: number;
  points: number;
  goals_for: number;
  goals_against: number;
  goal_differential: number;
  regulation_wins: number;
  head_to_head_wins: number;
}

// GET /api/standings - Get team standings for a season
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = standingsQuerySchema.parse(Object.fromEntries(searchParams));
      
      const supabase = await createServerSupabaseClient();

      // Get season rules for points calculation
      const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .select('rules')
        .eq('id', queryParams.season_id)
        .single();

      if (seasonError) {
        return NextResponse.json(
          { error: 'Season not found' },
          { status: 404 }
        );
      }

      const rules = season.rules || {
        points: { win: 2, otLoss: 1, loss: 0 },
        tiebreakers: ['points', 'regulationWins', 'goalDifferential', 'headToHead', 'goalsFor']
      };

      // Get all completed games for the season
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select(`
          id,
          home_team_id,
          away_team_id,
          home_team:teams!home_team_id(
            id,
            name,
            abbreviation
          ),
          away_team:teams!away_team_id(
            id,
            name,
            abbreviation
          )
        `)
        .eq('season_id', queryParams.season_id)
        .eq('status', 'COMPLETED');

      if (gamesError) {
        console.error('Error fetching games:', gamesError);
        return NextResponse.json(
          { error: 'Failed to fetch games' },
          { status: 500 }
        );
      }

      // Get all teams in the season
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, abbreviation')
        .eq('league_id', queryParams.league_id || '');

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        return NextResponse.json(
          { error: 'Failed to fetch teams' },
          { status: 500 }
        );
      }

      // Initialize standings for all teams
      const standings: Record<string, TeamStanding> = {};
      
      teams.forEach(team => {
        standings[team.id] = {
          team_id: team.id,
          team_name: team.name,
          team_abbreviation: team.abbreviation,
          games_played: 0,
          wins: 0,
          losses: 0,
          overtime_losses: 0,
          points: 0,
          goals_for: 0,
          goals_against: 0,
          goal_differential: 0,
          regulation_wins: 0,
          head_to_head_wins: 0,
        };
      });

      // Calculate standings from completed games
      for (const game of games || []) {
        // Get game stats to determine scores
        const { data: homeStats, error: homeStatsError } = await supabase
          .from('game_stats')
          .select('goals')
          .eq('game_id', game.id)
          .eq('team_id', game.home_team_id);

        const { data: awayStats, error: awayStatsError } = await supabase
          .from('game_stats')
          .select('goals')
          .eq('game_id', game.id)
          .eq('team_id', game.away_team_id);

        if (homeStatsError || awayStatsError) {
          console.error('Error fetching game stats:', homeStatsError || awayStatsError);
          continue;
        }

        // Calculate team scores
        const homeGoals = homeStats?.reduce((sum, stat) => sum + (stat.goals || 0), 0) || 0;
        const awayGoals = awayStats?.reduce((sum, stat) => sum + (stat.goals || 0), 0) || 0;

        const homeTeam = standings[game.home_team_id];
        const awayTeam = standings[game.away_team_id];

        if (homeTeam && awayTeam) {
          // Update games played
          homeTeam.games_played++;
          awayTeam.games_played++;

          // Update goals
          homeTeam.goals_for += homeGoals;
          homeTeam.goals_against += awayGoals;
          awayTeam.goals_for += awayGoals;
          awayTeam.goals_against += homeGoals;

          // Determine winner and update records
          if (homeGoals > awayGoals) {
            // Home team wins
            homeTeam.wins++;
            homeTeam.points += rules.points.win;
            awayTeam.losses++;
            awayTeam.points += rules.points.loss;
            
            // Check if it's a regulation win
            if (homeGoals - awayGoals >= 2) {
              homeTeam.regulation_wins++;
            }
          } else if (awayGoals > homeGoals) {
            // Away team wins
            awayTeam.wins++;
            awayTeam.points += rules.points.win;
            homeTeam.losses++;
            homeTeam.points += rules.points.loss;
            
            // Check if it's a regulation win
            if (awayGoals - homeGoals >= 2) {
              awayTeam.regulation_wins++;
            }
          } else {
            // Tie - both teams get OT loss points (shootout or OT)
            homeTeam.overtime_losses++;
            homeTeam.points += rules.points.otLoss;
            awayTeam.overtime_losses++;
            awayTeam.points += rules.points.otLoss;
          }
        }
      }

      // Calculate goal differentials
      Object.values(standings).forEach(team => {
        team.goal_differential = team.goals_for - team.goals_against;
      });

      // Calculate head-to-head records
      for (const game of games || []) {
        const homeTeam = standings[game.home_team_id];
        const awayTeam = standings[game.away_team_id];

        if (homeTeam && awayTeam) {
          const homeGoals = homeTeam.goals_for - homeTeam.goals_against;
          const awayGoals = awayTeam.goals_for - awayTeam.goals_against;

          if (homeGoals > awayGoals) {
            homeTeam.head_to_head_wins++;
          } else if (awayGoals > homeGoals) {
            awayTeam.head_to_head_wins++;
          }
        }
      }

      // Sort standings according to tiebreaker rules
      const sortedStandings = Object.values(standings).sort((a, b) => {
        for (const tiebreaker of rules.tiebreakers) {
          let comparison = 0;
          
          switch (tiebreaker) {
            case 'points':
              comparison = b.points - a.points;
              break;
            case 'regulationWins':
              comparison = b.regulation_wins - a.regulation_wins;
              break;
            case 'goalDifferential':
              comparison = b.goal_differential - a.goal_differential;
              break;
            case 'headToHead':
              comparison = b.head_to_head_wins - a.head_to_head_wins;
              break;
            case 'goalsFor':
              comparison = b.goals_for - a.goals_for;
              break;
          }
          
          if (comparison !== 0) {
            return comparison;
          }
        }
        
        return 0;
      });

      return NextResponse.json({
        data: {
          season_id: queryParams.season_id,
          standings: sortedStandings,
          rules: rules,
        },
      });
    } catch (error) {
      console.error('Error in GET /api/standings:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid request parameters' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to calculate standings' },
        { status: 500 }
      );
    }
  });
}
