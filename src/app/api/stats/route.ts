import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  createGameStatsSchema, 
  queryParamsSchema,
  type CreateGameStatsInput,
  type QueryParams
} from '@/lib/validations/league';
import { hasPermission } from '@/types/auth';

// GET /api/stats - List game statistics with filtering and pagination
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = queryParamsSchema.parse(Object.fromEntries(searchParams));
      
      const supabase = await createServerSupabaseClient();
      
      let query = supabase
        .from('game_stats')
        .select(`
          *,
          game:games(
            id,
            date,
            status,
            home_team:teams!home_team_id(name, abbreviation),
            away_team:teams!away_team_id(name, abbreviation)
          ),
          player:players(
            id,
            first_name,
            last_name,
            handle,
            position,
            number
          ),
          team:teams(
            id,
            name,
            abbreviation
          )
        `);

      // Apply filters
      if (queryParams.game_id) {
        query = query.eq('game_id', queryParams.game_id);
      }
      
      if (queryParams.player_id) {
        query = query.eq('player_id', queryParams.player_id);
      }

      if (queryParams.team_id) {
        query = query.eq('team_id', queryParams.team_id);
      }

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      query = query.range(offset, offset + queryParams.limit - 1);

      const { data: stats, error, count } = await query;

      if (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
          { error: 'Failed to fetch stats' },
          { status: 500 }
        );
      }

    return NextResponse.json({
        data: stats,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / queryParams.limit),
        },
      });
  } catch (error) {
      console.error('Error in GET /api/stats:', error);
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
  });
}

// POST /api/stats - Create new game statistics (Manager/Admin only)
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to enter stats
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canEnterStats')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to enter stats' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = createGameStatsSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      // Verify the game exists and user has access to it
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select(`
          season:seasons(
            league:leagues(owner_id)
          )
        `)
        .eq('id', validatedData.game_id)
        .single();

      if (gameError) {
        return NextResponse.json(
          { error: 'Game not found' },
          { status: 404 }
        );
      }

      // Check if user has permission to enter stats for this game
      const leagueOwnerId = game.season?.league?.owner_id;
      if (leagueOwnerId !== user.id && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        return NextResponse.json(
          { error: 'Insufficient permissions to enter stats for this game' },
          { status: 403 }
        );
      }

      // Verify the player and team exist and are valid
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('team_id')
        .eq('id', validatedData.player_id)
        .single();

      if (playerError) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }

      // Verify the team matches the player's team
      if (player.team_id !== validatedData.team_id) {
        return NextResponse.json(
          { error: 'Player does not belong to the specified team' },
          { status: 400 }
        );
      }

      // Check if stats already exist for this player in this game
      const { data: existingStats, error: existingError } = await supabase
        .from('game_stats')
        .select('id')
        .eq('game_id', validatedData.game_id)
        .eq('player_id', validatedData.player_id)
        .single();

      if (existingStats) {
        return NextResponse.json(
          { error: 'Stats already exist for this player in this game' },
          { status: 409 }
        );
      }

      const { data: stats, error } = await supabase
        .from('game_stats')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        console.error('Error creating stats:', error);
        return NextResponse.json(
          { error: 'Failed to create stats' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: stats }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/stats:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid stats data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create stats' },
        { status: 500 }
      );
    }
  });
}

