"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  TrophyIcon, 
  DownloadIcon, 
  SettingsIcon, 
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon
} from "lucide-react";

interface EAMatch {
  matchId: string;
  timestamp: string;
  timeago: string;
  clubs: Record<string, any>;
  players: Record<string, Record<string, any>>;
  aggregate: Record<string, any>;
}

export default function EASportsAdminPage() {
  const [clubIds, setClubIds] = useState<string>("3383, 4388, 490, 765");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<EAMatch[]>([]);
  const [importedGames, setImportedGames] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ea-sports/status');
      const data = await response.json();
      setIsConnected(data.connected);
      if (data.connected) {
        toast({
          title: "EA Sports Connected",
          description: "Successfully connected to EA Sports NHL API",
        });
      }
    } catch (error) {
      console.error('Failed to check EA Sports connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateClubIds = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ea-sports/club-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubIds: clubIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        }),
      });

      if (response.ok) {
        toast({
          title: "Club IDs Updated",
          description: "Successfully updated EA Sports club IDs",
        });
        await fetchMatches();
      } else {
        throw new Error('Failed to update club IDs');
      }
    } catch (error) {
      console.error('Failed to update club IDs:', error);
      toast({
        title: "Error",
        description: "Failed to update club IDs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ea-sports/matches');
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.matches);
        toast({
          title: "Matches Fetched",
          description: `Found ${data.matches.length} matches from EA Sports`,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch matches');
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches from EA Sports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importGame = async (matchId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ea-sports/import-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setImportedGames(prev => [...prev, matchId]);
        toast({
          title: "Game Imported",
          description: `Successfully imported game ${matchId} with ${data.statsCount} player stats`,
        });
      } else {
        throw new Error(data.error || 'Failed to import game');
      }
    } catch (error) {
      console.error('Failed to import game:', error);
      toast({
        title: "Error",
        description: `Failed to import game ${matchId}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importAllGames = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ea-sports/import-all', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        setImportedGames(prev => [...new Set([...prev, ...data.importedGames])]);
        toast({
          title: "All Games Imported",
          description: `Successfully imported ${data.importedGames.length} games`,
        });
      } else {
        throw new Error(data.error || 'Failed to import all games');
      }
    } catch (error) {
      console.error('Failed to import all games:', error);
      toast({
        title: "Error",
        description: "Failed to import all games",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">EA Sports Integration</h1>
          <p className="text-muted-foreground">
            Manage EA Sports NHL integration and import game statistics
          </p>
        </div>
        <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
          {isConnected ? (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              Connected
            </>
          ) : (
            <>
              <XCircleIcon className="h-4 w-4" />
              Disconnected
            </>
          )}
        </Badge>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Connection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Configure EA Sports NHL integration settings. The system connects to the EA Sports Pro Clubs API to fetch game data.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="club-ids">Club IDs</Label>
                <Input
                  id="club-ids"
                  value={clubIds}
                  onChange={(e) => setClubIds(e.target.value)}
                  placeholder="Enter club IDs separated by commas"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the EA Sports club IDs you want to track. Separate multiple IDs with commas.
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={updateClubIds} disabled={isLoading}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Update Settings
                </Button>
                <Button onClick={checkConnection} variant="outline" disabled={isLoading}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5" />
                Available Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                  Found {matches.length} matches from EA Sports
                </p>
                <Button onClick={fetchMatches} disabled={isLoading}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Refresh Matches
                </Button>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <TrophyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No matches found. Click "Refresh Matches" to fetch from EA Sports.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matches.map((match) => (
                    <div key={match.matchId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Match {match.matchId}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(match.timestamp).toLocaleString()} • {match.timeago}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {Object.keys(match.clubs).map((clubId) => (
                            <Badge key={clubId} variant="outline">
                              {match.clubs[clubId].name || `Club ${clubId}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {importedGames.includes(match.matchId) ? (
                          <Badge variant="default">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Imported
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => importGame(match.matchId)}
                            disabled={isLoading}
                          >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DownloadIcon className="h-5 w-5" />
                Bulk Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Import all available matches from EA Sports. This will create game records and player statistics in your database.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button onClick={importAllGames} disabled={isLoading || matches.length === 0}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Import All Games
                </Button>
                <Button onClick={fetchMatches} variant="outline" disabled={isLoading}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Refresh First
                </Button>
              </div>

              {importedGames.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recently Imported Games:</h4>
                  <div className="flex flex-wrap gap-2">
                    {importedGames.slice(-10).map((gameId) => (
                      <Badge key={gameId} variant="default">
                        {gameId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
