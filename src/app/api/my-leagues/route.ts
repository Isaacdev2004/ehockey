import {NextResponse, NextRequest} from 'next/server';
import { withAuth } from '@/lib/api/with-auth';4
import { createServerSupabaseClient } from '@/lib/supabase/server';


export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Leagues')
      .select('*')
      .eq('owner', user.email)
    if (error) console.error(error);

    return NextResponse.json({ data });
  });
}