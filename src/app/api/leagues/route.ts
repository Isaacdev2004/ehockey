import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  createLeagueSchema, 
  updateLeagueSchema, 
  queryParamsSchema,
  type CreateLeagueInput,
  type UpdateLeagueInput,
  type QueryParams
} from '@/lib/validations/league';
import { hasPermission } from '@/types/auth';

// GET /api/leagues - List all leagues with filtering and pagination
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = queryParamsSchema.parse(Object.fromEntries(searchParams));
      
    const supabase = await createServerSupabaseClient();
      
      let query = supabase
        .from('leagues')
        .select(`
          *,
          teams:teams(count),
          seasons:seasons(count)
        `);

      // Apply filters
      if (queryParams.search) {
        query = query.ilike('name', `%${queryParams.search}%`);
      }
      
      if (queryParams.status) {
        query = query.eq('status', queryParams.status);
      }

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      query = query.range(offset, offset + queryParams.limit - 1);

      const { data: leagues, error, count } = await query;

      if (error) {
        console.error('Error fetching leagues:', error);
        return NextResponse.json(
          { error: 'Failed to fetch leagues' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: leagues,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / queryParams.limit),
        },
      });
    } catch (error) {
      console.error('Error in GET /api/leagues:', error);
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
  });
}

// POST /api/leagues - Create a new league (Admin only)
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to create leagues
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canManageLeague')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create leagues' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = createLeagueSchema.parse(body);

      const supabase = await createServerSupabaseClient();

      const { data: league, error } = await supabase
        .from('leagues')
        .insert({
          ...validatedData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating league:', error);
        return NextResponse.json(
          { error: 'Failed to create league' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: league }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/leagues:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid league data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create league' },
        { status: 500 }
      );
    }
  });
}