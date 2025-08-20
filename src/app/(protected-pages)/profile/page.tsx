// src/app/(protected-pages)/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useProfile } from "@/hooks/use-profile";
import { ProfileFormData, profileSchema } from "@/lib/validations/profile";

export default function ProfilePage() {
  const { profile, updateProfile, isLoading } = useProfile();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || "",
      avatar_url: profile?.avatar_url || "",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(updateProfile)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="YourUsername" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public username that will be displayed on your profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a URL for your profile picture
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit">{isLoading ? 'Saving...': "Save Changes"}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}