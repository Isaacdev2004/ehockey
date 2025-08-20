import { Suspense } from "react"
import LeagueHeader from "@/components/league-header"
import RecentMatches from "@/components/recent-matches"
import LeagueStandings from "@/components/league-standings"
import TeamStats from "@/components/team-stats"
import PlayerStats from "@/components/player-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeagueDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LeagueHeader />
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <h2 className="text-2xl font-bold">League Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4">Recent Matches</h3>
                <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
                  <RecentMatches />
                </Suspense>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Top Teams</h3>
                <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
                  <LeagueStandings limit={5} />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="standings">
            <h2 className="text-2xl font-bold mb-6">League Standings</h2>
            <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-lg" />}>
              <LeagueStandings />
            </Suspense>
          </TabsContent>

          <TabsContent value="teams">
            <h2 className="text-2xl font-bold mb-6">Team Statistics</h2>
            <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-lg" />}>
              <TeamStats />
            </Suspense>
          </TabsContent>

          <TabsContent value="players">
            <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>
            <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-lg" />}>
              <PlayerStats />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
