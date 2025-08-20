import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  createTeamSchema, 
  queryParamsSchema,
  type CreateTeamInput,
  type QueryParams
} from '@/lib/validations/league';
import { hasPermission } from '@/types/auth';

// GET /api/teams - List all teams with filtering and pagination
export async function GET(request: NextRequest) {
    return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = queryParamsSchema.parse(Object.fromEntries(searchParams));
      
        const supabase = await createServerSupabaseClient();
      
      let query = supabase
        .from('teams')
        .select(`
          *,
          league:leagues(name),
          players:players(count),
          rosters:rosters(count)
        `);

      // Apply filters
      if (queryParams.search) {
        query = query.or(`name.ilike.%${queryParams.search}%,abbreviation.ilike.%${queryParams.search}%`);
      }
      
      if (queryParams.league_id) {
        query = query.eq('league_id', queryParams.league_id);
      }

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      query = query.range(offset, offset + queryParams.limit - 1);

      const { data: teams, error, count } = await query;

      if (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
          { error: 'Failed to fetch teams' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: teams,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / queryParams.limit),
        },
      });
    } catch (error) {
      console.error('Error in GET /api/teams:', error);
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
  });
}

// POST /api/teams - Create a new team (Manager/Admin only)
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage teams
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canManageTeam')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create teams' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = createTeamSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      // Verify the league exists and user has access to it
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('owner_id')
        .eq('id', validatedData.league_id)
        .single();

      if (leagueError) {
        return NextResponse.json(
          { error: 'League not found' },
          { status: 404 }
        );
      }

      // Only league owner, admin, or managers can create teams
      if (league.owner_id !== user.id && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        return NextResponse.json(
          { error: 'Insufficient permissions to create teams in this league' },
          { status: 403 }
        );
      }

      const { data: team, error } = await supabase
        .from('teams')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        console.error('Error creating team:', error);
        return NextResponse.json(
          { error: 'Failed to create team' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: team }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/teams:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid team data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      );
    }
  });
}