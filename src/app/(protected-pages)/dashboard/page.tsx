// src/app/(protected-pages)/dashboard/page.tsx
"use client";

import { useAuthSession } from "@/lib/utils/auth-utils";
import { useSignOut } from "@/lib/utils/auth-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import LeagueScrollable from "@/components/leaguesScrollable";
import { CreateLeagueDialog } from "@/components/create-league";
import { useState } from "react";

export default function DashboardPage() {
  const { session } = useAuthSession();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Welcome,{" "}
          {session?.user.user_metadata.full_name || session?.user.email}
        </h1>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/profile">Profile Settings</Link>
          </Button>
          <Button onClick={signOut} variant="outline">
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email: {session?.user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Last Sign In:{" "}
              {new Date(
                session?.user.last_sign_in_at || ""
              ).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Leagues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <LeagueScrollable />
            <Button className="w-full" variant="outline" asChild onClick={() => setOpen(true)}>
              <h2>Create League</h2>
            </Button>
          </CardContent>
        </Card>
        <CreateLeagueDialog open={open} onOpenChange={setOpen} />
      </div>
    </div>
  );
}