import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  createPlayerSchema, 
  queryParamsSchema,
  type CreatePlayerInput,
  type QueryParams
} from '@/lib/validations/league';
import { hasPermission } from '@/types/auth';

// GET /api/players - List all players with filtering and pagination
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = queryParamsSchema.parse(Object.fromEntries(searchParams));
      
      const supabase = await createServerSupabaseClient();
      
      let query = supabase
        .from('players')
        .select(`
          *,
          team:teams(
            id,
            name,
            abbreviation,
            league:leagues(name)
          )
        `);

      // Apply filters
      if (queryParams.search) {
        query = query.or(`first_name.ilike.%${queryParams.search}%,last_name.ilike.%${queryParams.search}%,handle.ilike.%${queryParams.search}%`);
      }
      
      if (queryParams.team_id) {
        query = query.eq('team_id', queryParams.team_id);
      }

      if (queryParams.status) {
        query = query.eq('is_active', queryParams.status === 'active');
      }

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      query = query.range(offset, offset + queryParams.limit - 1);

      const { data: players, error, count } = await query;

      if (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json(
          { error: 'Failed to fetch players' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: players,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / queryParams.limit),
        },
      });
    } catch (error) {
      console.error('Error in GET /api/players:', error);
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
  });
}

// POST /api/players - Create a new player (Manager/Admin only)
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage teams
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canManageTeam')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create players' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = createPlayerSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      // If team_id is provided, verify the team exists and user has access
      if (validatedData.team_id) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select(`
            league:leagues(owner_id)
          `)
          .eq('id', validatedData.team_id)
          .single();

        if (teamError) {
          return NextResponse.json(
            { error: 'Team not found' },
            { status: 404 }
          );
        }

        // Check if user has permission to add players to this team
        const leagueOwnerId = team.league?.owner_id;
        if (leagueOwnerId !== user.id && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
          return NextResponse.json(
            { error: 'Insufficient permissions to add players to this team' },
            { status: 403 }
          );
        }
      }

      const { data: player, error } = await supabase
        .from('players')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        console.error('Error creating player:', error);
        return NextResponse.json(
          { error: 'Failed to create player' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: player }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/players:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid player data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create player' },
        { status: 500 }
      );
    }
  });
}
