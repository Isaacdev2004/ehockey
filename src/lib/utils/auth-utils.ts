import { createClientSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useSignOut() {
  const router = useRouter();
  const { setLoading, clearSession } = useAuthStore();
  const supabase = createClientSupabaseClient();

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      clearSession();
      console.log("User signed out successfully");
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, clearSession, setLoading, router]);

  return signOut;
}

export function useAuthSession() {
  const { user, isLoading } = useAuthStore();

  return {
    session: user ? { user } : null,
    isLoading,
  };
}