import {NextResponse, NextRequest} from 'next/server';
import { withAuth } from '@/lib/api/with-auth';4
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CreateLeagueSchema } from '@/lib/validations/createLeague';

const DEFAULT_LEAGUE_LOGO = "https://banner2.cleanpng.com/20190609/owg/kisspng-ice-hockey-silhouette-clip-art-player-1713888338612.webp"

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    if(body.logo_url === "") body.logo_url = DEFAULT_LEAGUE_LOGO
    const validatedData = CreateLeagueSchema.parse(body);
    const { data, error } = await supabase
      .from('Leagues')
      .insert({
        league_name: validatedData.league_name,
        owner: user.email,
        description: validatedData.description,
        logo_url: validatedData.logo_url,
        created_at: new Date(),
      })
      .select('*')
      .single()
    if (error) console.error(error);

    return NextResponse.json({ data });
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    if(body.logo_url === "") body.logo_url = DEFAULT_LEAGUE_LOGO
    const validatedData = CreateLeagueSchema.parse(body);
    const { data, error } = await supabase
      .from('Leagues')
      .update({
        league_name: validatedData.league_name,
        owner: user.email,
        description: validatedData.description,
        logo_url: validatedData.logo_url,
        created_at: new Date(),
      })
      .eq('league_name', body.league_name)
        .eq('owner', user.email)
      .select('*')
      .single()
    if (error) console.error(error);

    return NextResponse.json({ data });
  });
}