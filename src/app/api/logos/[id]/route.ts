import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { hasPermission } from '@/types/auth';

const logoIdSchema = z.object({
  id: z.string().uuid('Invalid logo ID'),
});

const updateLogoSchema = z.object({
  name: z.string().min(1, 'Logo name is required').max(100, 'Logo name must be less than 100 characters').optional(),
  type: z.enum(['league', 'team', 'sponsor']).optional(),
  teamId: z.string().uuid().optional(),
  url: z.string().url('Invalid logo URL').optional(),
  alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text must be less than 200 characters').optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  is_active: z.boolean().optional(),
});

// GET /api/logos/[id] - Get a specific logo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      const { id } = logoIdSchema.parse(params);
      
      const supabase = await createServerSupabaseClient();

      const { data: logo, error } = await supabase
        .from('logos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Logo not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching logo:', error);
        return NextResponse.json(
          { error: 'Failed to fetch logo' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: logo });
    } catch (error) {
      console.error('Error in GET /api/logos/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid logo ID' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch logo' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/logos/[id] - Update a logo (Admin/Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage branding
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canConfigureBranding')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update logos' },
          { status: 403 }
        );
      }

      const { id } = logoIdSchema.parse(params);
      const body = await request.json();
      const validatedData = updateLogoSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      // Check if logo exists and get its current data
      const { data: existingLogo, error: fetchError } = await supabase
        .from('logos')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Logo not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching logo:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch logo' },
          { status: 500 }
        );
      }

      // If this is a team logo, verify the team exists and user has access
      if (validatedData.teamId) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select(`
            league:leagues(owner_id)
          `)
          .eq('id', validatedData.teamId)
          .single();

        if (teamError) {
          return NextResponse.json(
            { error: 'Team not found' },
            { status: 404 }
          );
        }

        // Check if user has permission to manage this team's logos
        const leagueOwnerId = team.league?.owner_id;
        if (leagueOwnerId !== user.id && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
          return NextResponse.json(
            { error: 'Insufficient permissions to manage logos for this team' },
            { status: 403 }
          );
        }
      }

      const { data: logo, error } = await supabase
        .from('logos')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating logo:', error);
        return NextResponse.json(
          { error: 'Failed to update logo' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: logo });
    } catch (error) {
      console.error('Error in PUT /api/logos/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid logo data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update logo' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/logos/[id] - Delete a logo (Admin/Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage branding
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canConfigureBranding')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete logos' },
          { status: 403 }
        );
      }

      const { id } = logoIdSchema.parse(params);
      
      const supabase = await createServerSupabaseClient();

      // Check if logo exists and get its current data
      const { data: existingLogo, error: fetchError } = await supabase
        .from('logos')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Logo not found' },
            { status: 404 }
          );
        }
        console.error('Error fetching logo:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch logo' },
          { status: 500 }
        );
      }

      // If this is a team logo, verify the team exists and user has access
      if (existingLogo.team_id) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select(`
            league:leagues(owner_id)
          `)
          .eq('id', existingLogo.team_id)
          .single();

        if (teamError) {
          return NextResponse.json(
            { error: 'Team not found' },
            { status: 404 }
          );
        }

        // Check if user has permission to manage this team's logos
        const leagueOwnerId = team.league?.owner_id;
        if (leagueOwnerId !== user.id && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
          return NextResponse.json(
            { error: 'Insufficient permissions to delete logos for this team' },
            { status: 403 }
          );
        }
      }

      const { error } = await supabase
        .from('logos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting logo:', error);
        return NextResponse.json(
          { error: 'Failed to delete logo' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Logo deleted successfully',
        data: { id }
      });
    } catch (error) {
      console.error('Error in DELETE /api/logos/[id]:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid logo ID' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete logo' },
        { status: 500 }
      );
    }
  });
}
