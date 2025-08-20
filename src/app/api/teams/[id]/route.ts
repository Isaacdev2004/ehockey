import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  updateTeamSchema, 
  teamIdSchema,
  type UpdateTeamInput
} from '@/lib/validations/league';
import { hasPermission } from '@/types/auth';

// GET /api/teams/[id] - Get a specific team with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      const { id } = teamIdSchema.parse(params);
      
      const supabase = await createServerSupabaseClient();
      
      const { data: team, error } = await supabase
        .from('teams')
        .select(`
          *,
          league:leagues(
            id,
            name,
            description,
            status
          ),
          players:players(
            id,
            first_name,
            last_name,
            handle,
            position,
            number,
            is_active
          ),
          rosters:rosters(
            id,
            player_id,
            role,
            start_date,
            end_date,
            player:players(
              first_name,
              last_name,
              handle,
              position,
              number
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Team not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching team:', error);
        return NextResponse.json(
          { error: 'Failed to fetch team' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: team });
    } catch (error) {
      console.error('Error in GET /api/teams/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid team ID' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch team' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/teams/[id] - Update a team (Manager/Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage teams
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canManageTeam')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update teams' },
          { status: 403 }
        );
      }

      const { id } = teamIdSchema.parse(params);
      const body = await request.json();
      const validatedData = updateTeamSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      // Check if team exists and get league info for permission check
      const { data: existingTeam, error: fetchError } = await supabase
        .from('teams')
        .select(`
          league_id,
          league:leagues(owner_id)
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Team not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching team:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch team' },
          { status: 500 }
        );
      }

      // Check permissions - only league owner, admin, or team managers can update
      const leagueOwnerId = existingTeam.league?.owner_id;
      if (leagueOwnerId !== user.id && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        return NextResponse.json(
          { error: 'Insufficient permissions to update this team' },
          { status: 403 }
        );
      }

      const { data: team, error } = await supabase
        .from('teams')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team:', error);
        return NextResponse.json(
          { error: 'Failed to update team' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: team });
    } catch (error) {
      console.error('Error in PUT /api/teams/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid team data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/teams/[id] - Delete a team (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage teams
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canManageTeam')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete teams' },
          { status: 403 }
        );
      }

      const { id } = teamIdSchema.parse(params);

      const supabase = await createServerSupabaseClient();

      // Check if team exists and get league info for permission check
      const { data: existingTeam, error: fetchError } = await supabase
        .from('teams')
        .select(`
          league_id,
          league:leagues(owner_id)
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Team not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching team:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch team' },
          { status: 500 }
        );
      }

      // Only league owner or admin can delete teams
      const leagueOwnerId = existingTeam.league?.owner_id;
      if (leagueOwnerId !== user.id && userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete this team' },
          { status: 403 }
        );
      }

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting team:', error);
        return NextResponse.json(
          { error: 'Failed to delete team' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Team deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in DELETE /api/teams/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid team ID' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      );
    }
  });
}
