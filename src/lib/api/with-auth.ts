// src/lib/api/with-auth.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function withAuth(
  request: NextRequest,
  handler: (user: User | null) => Promise<NextResponse>
) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return await handler(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}