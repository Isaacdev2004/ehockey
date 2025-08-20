// src/hooks/use-profile.ts
import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { ProfileFormData } from "@/lib/validations/profile";
import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface UseProfile {
  profile: Profile | null;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
}

export function useProfile(): UseProfile {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");

        const { data } = await response.json();
        const user = data as User;
        setProfile({
          id: user.id,
          full_name: user.user_metadata.full_name || null,
          username: user.user_metadata.username || null,
          avatar_url: user.user_metadata.avatar_url || null,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch profile",
        });
        setProfile(null);
      }
    }

    fetchProfile();
  }, []);

  const updateProfile = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, updateProfile, isLoading };
}