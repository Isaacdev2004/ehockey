"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrophyIcon, TargetIcon, TrendingUpIcon, UsersIcon } from "lucide-react";

interface PlayerStats {
  goals: number;
  assists: number;
  points: number;
  gamesPlayed: number;
  shots: number;
  penaltyMinutes: number;
  plusMinus: number;
  shootingPercentage: number;
  pointsPerGame: number;
}

interface PlayerInfo {
  id: string;
  username: string;
  avatar_url?: string;
  team_id?: string;
  team_name?: string;
  team_abbreviation?: string;
  team_logo?: string;
  position?: string;
  jersey_number?: number;
}

export default function PublicPlayerProfile({ params }: { params: { id: string } }) {
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch player information
    fetch(`/api/players/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setPlayerInfo(data.data);
          
          // If player has a team, fetch team info
          if (data.data.team_id) {
            fetch(`/api/teams/${data.data.team_id}`)
              .then(res => res.json())
              .then(teamData => {
                if (teamData.data) {
                  setPlayerInfo(prev => prev ? {
                    ...prev,
                    team_name: teamData.data.name,
                    team_abbreviation: teamData.data.abbreviation,
                    team_logo: teamData.data.logo_url,
                  } : null);
                }
              })
              .catch(console.error);
          }
        }
      })
      .catch(console.error);

    // Fetch player stats
    fetch(`/api/stats?player_id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          const stats = data.data.reduce((acc: PlayerStats, stat: any) => ({
            goals: acc.goals + (stat.goals || 0),
            assists: acc.assists + (stat.assists || 0),
            points: acc.points + (stat.points || 0),
            gamesPlayed: acc.gamesPlayed + 1,
            shots: acc.shots + (stat.shots || 0),
            penaltyMinutes: acc.penaltyMinutes + (stat.penalty_minutes || 0),
            plusMinus: acc.plusMinus + (stat.plus_minus || 0),
            shootingPercentage: 0, // Will calculate below
            pointsPerGame: 0, // Will calculate below
          }), {
            goals: 0,
            assists: 0,
            points: 0,
            gamesPlayed: 0,
            shots: 0,
            penaltyMinutes: 0,
            plusMinus: 0,
            shootingPercentage: 0,
            pointsPerGame: 0,
          });

          // Calculate derived stats
          stats.shootingPercentage = stats.shots > 0 ? (stats.goals / stats.shots) * 100 : 0;
          stats.pointsPerGame = stats.gamesPlayed > 0 ? stats.points / stats.gamesPlayed : 0;

          setPlayerStats(stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading player profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Player Not Found</h1>
          <p className="text-muted-foreground mt-2">The player you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Player Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-lg p-8 text-white">
        <div className="flex items-center space-x-6">
          <Avatar className="w-24 h-24 border-4 border-white/20">
            <AvatarImage src={playerInfo.avatar_url} alt={playerInfo.username} />
            <AvatarFallback className="text-2xl font-bold bg-blue-800">
              {playerInfo.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{playerInfo.username}</h1>
            <div className="flex items-center space-x-4 mt-2">
              {playerInfo.team_name && (
                <div className="flex items-center space-x-2">
                  {playerInfo.team_logo && (
                    <img 
                      src={playerInfo.team_logo} 
                      alt={playerInfo.team_name}
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <span className="text-blue-200">{playerInfo.team_name}</span>
                  <Badge variant="secondary">{playerInfo.team_abbreviation}</Badge>
                </div>
              )}
              {playerInfo.position && (
                <Badge variant="outline" className="text-white border-white/30">
                  {playerInfo.position}
                </Badge>
              )}
              {playerInfo.jersey_number && (
                <Badge variant="outline" className="text-white border-white/30">
                  #{playerInfo.jersey_number}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats?.gamesPlayed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{playerStats?.goals || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assists</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{playerStats?.assists || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{playerStats?.points || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Stats</TabsTrigger>
          <TabsTrigger value="recent">Recent Games</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Season Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Goals</span>
                    <span className="text-lg font-bold text-green-600">{playerStats?.goals || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Assists</span>
                    <span className="text-lg font-bold text-blue-600">{playerStats?.assists || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Points</span>
                    <span className="text-lg font-bold text-purple-600">{playerStats?.points || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Games Played</span>
                    <span className="text-lg font-bold">{playerStats?.gamesPlayed || 0}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Shots</span>
                    <span className="text-lg font-bold">{playerStats?.shots || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Penalty Minutes</span>
                    <span className="text-lg font-bold text-red-600">{playerStats?.penaltyMinutes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Plus/Minus</span>
                    <span className={`text-lg font-bold ${(playerStats?.plusMinus || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(playerStats?.plusMinus || 0) >= 0 ? '+' : ''}{playerStats?.plusMinus || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Points Per Game</span>
                    <span className="text-lg font-bold">{(playerStats?.pointsPerGame || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Shooting Percentage</span>
                    <span className="text-lg font-bold">{(playerStats?.shootingPercentage || 0).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Goals Per Game</span>
                    <span className="text-lg font-bold">
                      {playerStats?.gamesPlayed ? (playerStats.goals / playerStats.gamesPlayed).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Assists Per Game</span>
                    <span className="text-lg font-bold">
                      {playerStats?.gamesPlayed ? (playerStats.assists / playerStats.gamesPlayed).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Recent game data will be displayed here once games are played.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
