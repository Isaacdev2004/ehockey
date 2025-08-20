import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  updateLeagueSchema, 
  leagueIdSchema,
  type UpdateLeagueInput
} from '@/lib/validations/league';
import { hasPermission } from '@/types/auth';

// GET /api/leagues/[id] - Get a specific league with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      const { id } = leagueIdSchema.parse(params);
      
      const supabase = await createServerSupabaseClient();
      
      const { data: league, error } = await supabase
        .from('leagues')
        .select(`
          *,
          teams:teams(
            id,
            name,
            abbreviation,
            colors,
            logo_url
          ),
          seasons:seasons(
            id,
            name,
            start_date,
            end_date,
            status
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'League not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching league:', error);
        return NextResponse.json(
          { error: 'Failed to fetch league' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: league });
    } catch (error) {
      console.error('Error in GET /api/leagues/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid league ID' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch league' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/leagues/[id] - Update a league (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage leagues
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canManageLeague')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update leagues' },
          { status: 403 }
        );
      }

      const { id } = leagueIdSchema.parse(params);
      const body = await request.json();
      const validatedData = updateLeagueSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      // Check if league exists and user has permission to update it
      const { data: existingLeague, error: fetchError } = await supabase
        .from('leagues')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'League not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching league:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch league' },
          { status: 500 }
        );
      }

      // Only league owner or admin can update
      if (existingLeague.owner_id !== user.id && userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions to update this league' },
          { status: 403 }
        );
      }

      const { data: league, error } = await supabase
        .from('leagues')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating league:', error);
        return NextResponse.json(
          { error: 'Failed to update league' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: league });
    } catch (error) {
      console.error('Error in PUT /api/leagues/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid league data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update league' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/leagues/[id] - Delete a league (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage leagues
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canManageLeague')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete leagues' },
          { status: 403 }
        );
      }

      const { id } = leagueIdSchema.parse(params);

      const supabase = await createServerSupabaseClient();

      // Check if league exists and user has permission to delete it
      const { data: existingLeague, error: fetchError } = await supabase
        .from('leagues')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'League not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching league:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch league' },
          { status: 500 }
        );
      }

      // Only league owner or admin can delete
      if (existingLeague.owner_id !== user.id && userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete this league' },
          { status: 403 }
        );
      }

      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting league:', error);
        return NextResponse.json(
          { error: 'Failed to delete league' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'League deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in DELETE /api/leagues/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid league ID' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete league' },
        { status: 500 }
      );
    }
  });
}
