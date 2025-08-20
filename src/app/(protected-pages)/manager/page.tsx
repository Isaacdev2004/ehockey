"use client";

import { useAuthSession } from "@/lib/utils/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types/auth";
import { useTeams, usePlayers, useGames, useCreatePlayer, useCreateGame, useCreateGameStats } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { Plus, Users, Calendar, BarChart3, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  handle: string;
  position: string;
  number?: number;
  is_active: boolean;
}

interface Game {
  id: string;
  date: string;
  home_team: { name: string; abbreviation: string };
  away_team: { name: string; abbreviation: string };
  status: string;
  venue?: string;
}

interface GameStats {
  player_id: string;
  team_id: string;
  goals: number;
  assists: number;
  points: number;
  shots: number;
  time_on_ice: number;
  penalty_minutes: number;
  plus_minus: number;
  saves?: number;
  goals_against?: number;
}

export default function ManagerPanel() {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({});

  // API hooks
  const { data: teams, loading: teamsLoading } = useTeams();
  const { data: players, loading: playersLoading } = usePlayers(selectedTeamId);
  const { data: allGames, loading: gamesLoading } = useGames();
  const { createPlayer, loading: creatingPlayer, error: playerError } = useCreatePlayer();
  const { createGame, loading: creatingGame, error: gameError } = useCreateGame();
  const { createGameStats, loading: creatingStats, error: statsError } = useCreateGameStats();

  // Form states
  const [newPlayer, setNewPlayer] = useState({
    first_name: '',
    last_name: '',
    handle: '',
    position: 'C',
    number: '',
    team_id: selectedTeamId || ''
  });

  const [newGame, setNewGame] = useState({
    date: '',
    home_team_id: '',
    away_team_id: '',
    venue: '',
    notes: ''
  });

  useEffect(() => {
    if (teams && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams]);

  useEffect(() => {
    if (players) {
      setTeamMembers(players);
    }
  }, [players]);

  useEffect(() => {
    if (allGames) {
      setGames(allGames);
    }
  }, [allGames]);

  const handleCreatePlayer = async () => {
    try {
      await createPlayer({
        ...newPlayer,
        number: newPlayer.number ? parseInt(newPlayer.number) : undefined,
        team_id: selectedTeamId
      });
      setNewPlayer({
        first_name: '',
        last_name: '',
        handle: '',
        position: 'C',
        number: '',
        team_id: selectedTeamId || ''
      });
      toast({
        title: "Success",
        description: "Player created successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error('Error creating player:', error);
      toast({
        title: "Error",
        description: "Failed to create player. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateGame = async () => {
    try {
      await createGame({
        ...newGame,
        season_id: 'demo-season-id', // TODO: Get from context
        status: 'SCHEDULED'
      });
      setNewGame({
        date: '',
        home_team_id: '',
        away_team_id: '',
        venue: '',
        notes: ''
      });
      toast({
        title: "Success",
        description: "Game scheduled successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to schedule game. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatsChange = (playerId: string, field: keyof GameStats, value: number) => {
    setGameStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        player_id: playerId,
        team_id: selectedTeamId || '',
        [field]: value,
        points: field === 'goals' || field === 'assists' 
          ? (prev[playerId]?.goals || 0) + (prev[playerId]?.assists || 0)
          : prev[playerId]?.points || 0
      }
    }));
  };

  const handleSaveStats = async () => {
    if (!selectedGameId) return;

    try {
      const statsToSave = Object.values(gameStats).filter(stat => 
        stat.goals > 0 || stat.assists > 0 || stat.shots > 0 || stat.time_on_ice > 0
      );

      for (const stat of statsToSave) {
        await createGameStats({
          ...stat,
          game_id: selectedGameId,
          points: stat.goals + stat.assists
        });
      }

      // Clear form after successful save
      setGameStats({});
      toast({
        title: "Success",
        description: "Game statistics saved successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving stats:', error);
      toast({
        title: "Error",
        description: "Failed to save statistics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSelectedGame = () => {
    return games.find(g => g.id === selectedGameId);
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  if (teamsLoading || playersLoading || gamesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading manager data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manager Panel</h1>
          <p className="text-muted-foreground">Manage your team, schedule games, and track statistics</p>
        </div>
        <Badge variant="secondary">{UserRole.MANAGER}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="stats">Stats Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">Active players</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Games</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {games.filter(g => g.status === 'SCHEDULED').length}
                </div>
                <p className="text-xs text-muted-foreground">Upcoming matches</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Games</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {games.filter(g => g.status === 'COMPLETED').length}
                </div>
                <p className="text-xs text-muted-foreground">Season total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Record</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0-0-0</div>
                <p className="text-xs text-muted-foreground">W-L-OTL</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Roster</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Player</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={newPlayer.first_name}
                            onChange={(e) => setNewPlayer({...newPlayer, first_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={newPlayer.last_name}
                            onChange={(e) => setNewPlayer({...newPlayer, last_name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="handle">Handle</Label>
                        <Input
                          id="handle"
                          value={newPlayer.handle}
                          onChange={(e) => setNewPlayer({...newPlayer, handle: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="position">Position</Label>
                          <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer({...newPlayer, position: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="C">Center</SelectItem>
                              <SelectItem value="LW">Left Wing</SelectItem>
                              <SelectItem value="RW">Right Wing</SelectItem>
                              <SelectItem value="D">Defense</SelectItem>
                              <SelectItem value="G">Goalie</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="number">Number</Label>
                          <Input
                            id="number"
                            type="number"
                            value={newPlayer.number}
                            onChange={(e) => setNewPlayer({...newPlayer, number: e.target.value})}
                          />
                        </div>
                      </div>
                      <Button onClick={handleCreatePlayer} disabled={creatingPlayer}>
                        {creatingPlayer ? 'Adding...' : 'Add Player'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {member.number || '#'}
                      </div>
                      <div>
                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-muted-foreground">@{member.handle} • {member.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No team members found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Game Schedule</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule New Game</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="game_date">Game Date</Label>
                        <Input
                          id="game_date"
                          type="datetime-local"
                          value={newGame.date}
                          onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="home_team">Home Team</Label>
                          <Select value={newGame.home_team_id} onValueChange={(value) => setNewGame({...newGame, home_team_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select home team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams?.map((team) => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="away_team">Away Team</Label>
                          <Select value={newGame.away_team_id} onValueChange={(value) => setNewGame({...newGame, away_team_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select away team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams?.map((team) => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="venue">Venue</Label>
                        <Input
                          id="venue"
                          value={newGame.venue}
                          onChange={(e) => setNewGame({...newGame, venue: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newGame.notes}
                          onChange={(e) => setNewGame({...newGame, notes: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleCreateGame} disabled={creatingGame}>
                        {creatingGame ? 'Scheduling...' : 'Schedule Game'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {games.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {game.home_team?.name} vs {game.away_team?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(game.date).toLocaleDateString()} • {game.venue || 'TBD'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={game.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {game.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {games.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No games scheduled</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Game Selection */}
              <div className="space-y-2">
                <Label htmlFor="game_select">Select Game</Label>
                <Select value={selectedGameId || ''} onValueChange={setSelectedGameId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a game to enter stats for" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.filter(g => g.status === 'COMPLETED' || g.status === 'IN_PROGRESS').map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.home_team?.name} vs {game.away_team?.name} - {new Date(game.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGameId && (
                <>
                  {/* Game Info */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Game Information</h3>
                    <p className="text-sm text-muted-foreground">
                      {getSelectedGame()?.home_team?.name} vs {getSelectedGame()?.away_team?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getSelectedGame()?.date && new Date(getSelectedGame()!.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Stats Entry Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Player Statistics</h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setGameStats({})}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleSaveStats}
                          disabled={creatingStats}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {creatingStats ? 'Saving...' : 'Save Stats'}
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>G</TableHead>
                            <TableHead>A</TableHead>
                            <TableHead>P</TableHead>
                            <TableHead>S</TableHead>
                            <TableHead>TOI</TableHead>
                            <TableHead>PIM</TableHead>
                            <TableHead>+/-</TableHead>
                            {teamMembers.some(p => p.position === 'G') && (
                              <>
                                <TableHead>SV</TableHead>
                                <TableHead>GA</TableHead>
                              </>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers.map((player) => {
                            const stats = gameStats[player.id] || {
                              player_id: player.id,
                              team_id: selectedTeamId || '',
                              goals: 0,
                              assists: 0,
                              points: 0,
                              shots: 0,
                              time_on_ice: 0,
                              penalty_minutes: 0,
                              plus_minus: 0,
                              saves: 0,
                              goals_against: 0
                            };

                            return (
                              <TableRow key={player.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{player.first_name} {player.last_name}</p>
                                    <p className="text-sm text-muted-foreground">#{player.number} • {player.position}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={stats.goals}
                                    onChange={(e) => handleStatsChange(player.id, 'goals', parseInt(e.target.value) || 0)}
                                    className="w-16"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={stats.assists}
                                    onChange={(e) => handleStatsChange(player.id, 'assists', parseInt(e.target.value) || 0)}
                                    className="w-16"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{stats.goals + stats.assists}</div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={stats.shots}
                                    onChange={(e) => handleStatsChange(player.id, 'shots', parseInt(e.target.value) || 0)}
                                    className="w-16"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={stats.time_on_ice}
                                    onChange={(e) => handleStatsChange(player.id, 'time_on_ice', parseInt(e.target.value) || 0)}
                                    className="w-20"
                                    placeholder="0"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={stats.penalty_minutes}
                                    onChange={(e) => handleStatsChange(player.id, 'penalty_minutes', parseInt(e.target.value) || 0)}
                                    className="w-16"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={stats.plus_minus}
                                    onChange={(e) => handleStatsChange(player.id, 'plus_minus', parseInt(e.target.value) || 0)}
                                    className="w-16"
                                  />
                                </TableCell>
                                {teamMembers.some(p => p.position === 'G') && (
                                  <>
                                    <TableCell>
                                      {player.position === 'G' ? (
                                        <Input
                                          type="number"
                                          min="0"
                                          value={stats.saves || 0}
                                          onChange={(e) => handleStatsChange(player.id, 'saves', parseInt(e.target.value) || 0)}
                                          className="w-16"
                                        />
                                      ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                      {player.position === 'G' ? (
                                        <Input
                                          type="number"
                                          min="0"
                                          value={stats.goals_against || 0}
                                          onChange={(e) => handleStatsChange(player.id, 'goals_against', parseInt(e.target.value) || 0)}
                                          className="w-16"
                                        />
                                      ) : '-'}
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p><strong>Legend:</strong> G = Goals, A = Assists, P = Points, S = Shots, TOI = Time on Ice (seconds), PIM = Penalty Minutes, +/- = Plus/Minus</p>
                      {teamMembers.some(p => p.position === 'G') && (
                        <p>SV = Saves, GA = Goals Against (Goalie stats)</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!selectedGameId && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select a completed or in-progress game to enter statistics.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
