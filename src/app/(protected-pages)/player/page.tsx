"use client";

import { useAuthSession } from "@/lib/utils/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types/auth";
import { usePlayers, useGames, useTeam } from "@/hooks/use-api";
import { useEffect, useState } from "react";

interface PlayerStats {
  goals: number;
  assists: number;
  points: number;
  gamesPlayed: number;
  shots: number;
  penaltyMinutes: number;
  plusMinus: number;
}

interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string;
}

export default function PlayerPanel() {
  const { session } = useAuthSession();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch player data
  const { data: players, loading: playersLoading } = usePlayers();
  const { data: games, loading: gamesLoading } = useGames();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Find the current player
    const currentPlayer = players?.find(p => p.id === session.user.id);
    
    if (currentPlayer?.team_id) {
      // Fetch team info
      fetch(`/api/teams/${currentPlayer.team_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setTeamInfo({
              id: data.data.id,
              name: data.data.name,
              abbreviation: data.data.abbreviation,
              logoUrl: data.data.logo_url,
            });
          }
        })
        .catch(console.error);

      // Calculate player stats from game stats
      fetch(`/api/stats?player_id=${currentPlayer.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const stats = data.data.reduce((acc: PlayerStats, stat: any) => ({
              goals: acc.goals + (stat.goals || 0),
              assists: acc.assists + (stat.assists || 0),
              points: acc.points + (stat.points || 0),
              gamesPlayed: acc.gamesPlayed + 1,
              shots: acc.shots + (stat.shots || 0),
              penaltyMinutes: acc.penaltyMinutes + (stat.penalty_minutes || 0),
              plusMinus: acc.plusMinus + (stat.plus_minus || 0),
            }), {
              goals: 0,
              assists: 0,
              points: 0,
              gamesPlayed: 0,
              shots: 0,
              penaltyMinutes: 0,
              plusMinus: 0,
            });
            setPlayerStats(stats);
          }
        })
        .catch(console.error);
    }

    setLoading(false);
  }, [session, players, games]);

  if (!session) {
    return <div>Loading...</div>;
  }

  if (playersLoading || gamesLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading player data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Player Panel</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.user_metadata.full_name || session.user.email}
          </p>
        </div>
        <Badge variant="secondary">{UserRole.PLAYER}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">My Stats</TabsTrigger>
          <TabsTrigger value="team">Team Info</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {playerStats?.gamesPlayed || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {playerStats?.goals || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {playerStats?.assists || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {playerStats?.points || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Season Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading stats...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Goals:</span>
                      <span className="font-semibold">{playerStats?.goals || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assists:</span>
                      <span className="font-semibold">{playerStats?.assists || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Points:</span>
                      <span className="font-semibold">{playerStats?.points || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Games Played:</span>
                      <span className="font-semibold">{playerStats?.gamesPlayed || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Shots:</span>
                      <span className="font-semibold">{playerStats?.shots || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penalty Minutes:</span>
                      <span className="font-semibold">{playerStats?.penaltyMinutes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plus/Minus:</span>
                      <span className="font-semibold">{playerStats?.plusMinus || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
            </CardHeader>
            <CardContent>
              {teamInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {teamInfo.logoUrl && (
                      <img
                        src={teamInfo.logoUrl}
                        alt={`${teamInfo.name} logo`}
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{teamInfo.name}</h3>
                      <p className="text-muted-foreground">{teamInfo.abbreviation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No team assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Games</CardTitle>
            </CardHeader>
            <CardContent>
              {games && games.length > 0 ? (
                <div className="space-y-2">
                  {games
                    .filter(game => game.status === 'SCHEDULED')
                    .slice(0, 5)
                    .map(game => (
                      <div key={game.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">
                            {game.home_team?.name} vs {game.away_team?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(game.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{game.status}</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming games scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
