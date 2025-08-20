import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { hasPermission } from '@/types/auth';

// Validation schemas
const createLogoSchema = z.object({
  name: z.string().min(1, 'Logo name is required').max(100, 'Logo name must be less than 100 characters'),
  type: z.enum(['league', 'team', 'sponsor']),
  teamId: z.string().uuid().optional(),
  url: z.string().url('Invalid logo URL'),
  alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text must be less than 200 characters'),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

const updateLogoSchema = createLogoSchema.partial();

const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(['league', 'team', 'sponsor']).optional(),
  teamId: z.string().uuid().optional(),
});

// GET /api/logos - List all logos with filtering
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = queryParamsSchema.parse(Object.fromEntries(searchParams));
      
      const supabase = await createServerSupabaseClient();

      let query = supabase
        .from('logos')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (queryParams.type) {
        query = query.eq('type', queryParams.type);
      }

      if (queryParams.teamId) {
        query = query.eq('team_id', queryParams.teamId);
      }

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      query = query.range(offset, offset + queryParams.limit - 1);

      const { data: logos, error, count } = await query;

      if (error) {
        console.error('Error fetching logos:', error);
        return NextResponse.json(
          { error: 'Failed to fetch logos' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: logos,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / queryParams.limit),
        },
      });
    } catch (error) {
      console.error('Error in GET /api/logos:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid request parameters' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch logos' },
        { status: 500 }
      );
    }
  });
}

// POST /api/logos - Create a new logo (Admin/Manager only)
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage branding
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canConfigureBranding')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to manage logos' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = createLogoSchema.parse(body);

      const supabase = await createServerSupabaseClient();

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
        .insert({
          ...validatedData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating logo:', error);
        return NextResponse.json(
          { error: 'Failed to create logo' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: logo }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/logos:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid logo data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create logo' },
        { status: 500 }
      );
    }
  });
}
