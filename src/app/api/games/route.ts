import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  createGameSchema, 
  queryParamsSchema,
  type CreateGameInput,
  type QueryParams
} from '@/lib/validations/league';
import { hasPermission } from '@/types/auth';

// GET /api/games - List all games with filtering and pagination
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = queryParamsSchema.parse(Object.fromEntries(searchParams));
      
      const supabase = await createServerSupabaseClient();
      
      let query = supabase
        .from('games')
        .select(`
          *,
          season:seasons(
            id,
            name,
            league:leagues(name)
          ),
          home_team:teams!home_team_id(
            id,
            name,
            abbreviation,
            colors
          ),
          away_team:teams!away_team_id(
            id,
            name,
            abbreviation,
            colors
          ),
          game_stats:game_stats(count)
        `);

      // Apply filters
      if (queryParams.season_id) {
        query = query.eq('season_id', queryParams.season_id);
      }
      
      if (queryParams.status) {
        query = query.eq('status', queryParams.status);
      }

      if (queryParams.team_id) {
        query = query.or(`home_team_id.eq.${queryParams.team_id},away_team_id.eq.${queryParams.team_id}`);
      }

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      query = query.range(offset, offset + queryParams.limit - 1);

      const { data: games, error, count } = await query;

      if (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
          { error: 'Failed to fetch games' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: games,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / queryParams.limit),
        },
      });
    } catch (error) {
      console.error('Error in GET /api/games:', error);
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
  });
}

// POST /api/games - Create a new game (Manager/Admin only)
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to create games
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canCreateGames')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create games' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = createGameSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      // Verify the season exists and user has access to it
      const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .select(`
          league:leagues(owner_id)
        `)
        .eq('id', validatedData.season_id)
        .single();

      if (seasonError) {
        return NextResponse.json(
          { error: 'Season not found' },
          { status: 404 }
        );
      }

      // Check if user has permission to create games in this season
      const leagueOwnerId = season.league?.owner_id;
      if (leagueOwnerId !== user.id && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        return NextResponse.json(
          { error: 'Insufficient permissions to create games in this season' },
          { status: 403 }
        );
      }

      // Verify both teams exist and belong to the same league
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('league_id')
        .in('id', [validatedData.home_team_id, validatedData.away_team_id]);

      if (teamsError || teams.length !== 2) {
        return NextResponse.json(
          { error: 'One or both teams not found' },
          { status: 404 }
        );
      }

      // Check if both teams belong to the same league as the season
      const { data: seasonLeague } = await supabase
        .from('seasons')
        .select('league_id')
        .eq('id', validatedData.season_id)
        .single();

      if (teams.some(team => team.league_id !== seasonLeague?.league_id)) {
        return NextResponse.json(
          { error: 'Teams must belong to the same league as the season' },
          { status: 400 }
        );
      }

      const { data: game, error } = await supabase
        .from('games')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        console.error('Error creating game:', error);
        return NextResponse.json(
          { error: 'Failed to create game' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: game }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/games:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid game data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create game' },
        { status: 500 }
      );
    }
  });
}
