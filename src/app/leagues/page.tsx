'use client";'
import { AllLeaguesScrollable } from "@/components/leaguesScrollable";
import { Card } from "@/components/ui/card";

export default function LeaguesPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">EASHL Leagues</h1>
        <p className="text-muted-foreground mt-2">
          Browse all available leagues
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Leagues</h2>
          </div>
          <AllLeaguesScrollable />
        </div>
      </Card>
    </div>
  );
}

