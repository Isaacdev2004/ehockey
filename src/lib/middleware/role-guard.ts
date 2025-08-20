import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { UserRole, hasPermission } from "@/types/auth";

export interface RoleGuardOptions {
  requiredRole?: UserRole;
  requiredPermission?: keyof import("@/types/auth").UserPermissions;
  redirectTo?: string;
}

export async function withRoleGuard(
  request: Request,
  options: RoleGuardOptions = {},
  handler: (user: any) => Promise<NextResponse>
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

    // Get user role from accounts table
    const { data: accountData, error: accountError } = await supabase
      .from("accounts")
      .select("role")
      .eq("id", user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    const userRole = accountData.role as UserRole;

    // Check required role
    if (options.requiredRole && userRole !== options.requiredRole) {
      if (options.redirectTo) {
        return NextResponse.redirect(new URL(options.redirectTo, request.url));
      }
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check required permission
    if (options.requiredPermission && !hasPermission(userRole, options.requiredPermission)) {
      if (options.redirectTo) {
        return NextResponse.redirect(new URL(options.redirectTo, request.url));
      }
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    return await handler({ ...user, role: userRole });
  } catch (error) {
    console.error("Role guard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export function requireRole(role: UserRole) {
  return (request: Request) => withRoleGuard(request, { requiredRole: role }, async () => {
    return NextResponse.next();
  });
}

export function requirePermission(permission: keyof import("@/types/auth").UserPermissions) {
  return (request: Request) => withRoleGuard(request, { requiredPermission: permission }, async () => {
    return NextResponse.next();
  });
}
