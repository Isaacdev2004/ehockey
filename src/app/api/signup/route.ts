// src/app/api/auth/register/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { registerSchema } from "@/lib/validations/auth"
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })
    await supabase.auth.updateUser({
      data: {
        ...validatedData,
      }
    })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register" },
      { status: 400 }
    )
  }
}
