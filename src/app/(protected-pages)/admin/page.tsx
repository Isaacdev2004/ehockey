"use client";

import { useAuthSession } from "@/lib/utils/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types/auth";
import { useLeagues, useTeams, usePlayers, useGames, useCreateLeague, useCreateTeam } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { Plus, Users, Trophy, Settings, Palette, Download, Upload, Edit, Trash2, Eye, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogoUpload } from "@/components/ui/logo-upload";
import { StatsQueueManager } from "@/components/ui/stats-queue-manager";
import { LogoPreview } from "@/components/ui/logo-preview";

interface League {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  teams?: Array<{ id: string; name: string }>;
  seasons?: Array<{ id: string; name: string }>;
}

interface User {
  id: string;
  email: string;
  role: string;
  team_id?: string;
  is_active: boolean;
  created_at: string;
}

interface SystemStats {
  totalUsers: number;
  totalLeagues: number;
  totalTeams: number;
  totalGames: number;
}

export default function AdminPanel() {
  const { session } = useAuthSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalLeagues: 0,
    totalTeams: 0,
    totalGames: 0,
  });

  // API hooks
  const { data: leaguesData, loading: leaguesLoading } = useLeagues();
  const { data: teamsData, loading: teamsLoading } = useTeams();
  const { data: playersData, loading: playersLoading } = usePlayers();
  const { data: gamesData, loading: gamesLoading } = useGames();
  const { createLeague, loading: creatingLeague, error: leagueError } = useCreateLeague();
  const { createTeam, loading: creatingTeam, error: teamError } = useCreateTeam();

  // Form states
  const [newLeague, setNewLeague] = useState({
    name: '',
    description: '',
    logo_url: '',
    status: 'ACTIVE'
  });

  const [newTeam, setNewTeam] = useState({
    name: '',
    abbreviation: '',
    league_id: '',
    primary_color: '#1e40af',
    secondary_color: '#3b82f6',
    logo_url: ''
  });

  const [branding, setBranding] = useState({
    logo_url: '/logo.png',
    primary_color: '#1e40af',
    secondary_color: '#3b82f6'
  });

  useEffect(() => {
    if (leaguesData) {
      setLeagues(leaguesData);
      setSystemStats(prev => ({ ...prev, totalLeagues: leaguesData.length }));
    }
  }, [leaguesData]);

  useEffect(() => {
    if (teamsData) {
      setSystemStats(prev => ({ ...prev, totalTeams: teamsData.length }));
    }
  }, [teamsData]);

  useEffect(() => {
    if (playersData) {
      setSystemStats(prev => ({ ...prev, totalUsers: playersData.length }));
    }
  }, [playersData]);

  useEffect(() => {
    if (gamesData) {
      setSystemStats(prev => ({ ...prev, totalGames: gamesData.length }));
    }
  }, [gamesData]);

  const handleCreateLeague = async () => {
    try {
      await createLeague(newLeague);
      setNewLeague({
        name: '',
        description: '',
        logo_url: '',
        status: 'ACTIVE'
      });
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };

  const handleCreateTeam = async () => {
    try {
      await createTeam({
        ...newTeam,
        colors: {
          primary: newTeam.primary_color,
          secondary: newTeam.secondary_color
        }
      });
      setNewTeam({
        name: '',
        abbreviation: '',
        league_id: '',
        primary_color: '#1e40af',
        secondary_color: '#3b82f6',
        logo_url: ''
      });
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleExportData = (type: 'leagues' | 'teams' | 'players' | 'games') => {
    // TODO: Implement CSV export
    console.log(`Exporting ${type} data...`);
  };

  const handleImportData = (type: 'leagues' | 'teams' | 'players' | 'games') => {
    // TODO: Implement CSV import
    console.log(`Importing ${type} data...`);
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  if (leaguesLoading || teamsLoading || playersLoading || gamesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading admin data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage leagues, users, and system configuration</p>
        </div>
        <Badge variant="destructive">{UserRole.ADMIN}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leagues">League Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="stats">Stats Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered players</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalLeagues}</div>
                <p className="text-xs text-muted-foreground">Active leagues</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalTeams}</div>
                <p className="text-xs text-muted-foreground">Registered teams</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalGames}</div>
                <p className="text-xs text-muted-foreground">Scheduled games</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create League
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No recent activity</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leagues" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>League Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create League
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New League</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="league_name">League Name</Label>
                        <Input
                          id="league_name"
                          value={newLeague.name}
                          onChange={(e) => setNewLeague({...newLeague, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="league_description">Description</Label>
                        <Textarea
                          id="league_description"
                          value={newLeague.description}
                          onChange={(e) => setNewLeague({...newLeague, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="league_logo">Logo URL</Label>
                        <Input
                          id="league_logo"
                          value={newLeague.logo_url}
                          onChange={(e) => setNewLeague({...newLeague, logo_url: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="league_status">Status</Label>
                        <Select value={newLeague.status} onValueChange={(value) => setNewLeague({...newLeague, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateLeague} disabled={creatingLeague}>
                        {creatingLeague ? 'Creating...' : 'Create League'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Seasons</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leagues.map((league) => (
                    <TableRow key={league.id}>
                      <TableCell className="font-medium">{league.name}</TableCell>
                      <TableCell>
                        <Badge variant={league.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {league.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{league.teams?.length || 0}</TableCell>
                      <TableCell>{league.seasons?.length || 0}</TableCell>
                      <TableCell>{new Date(league.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playersData?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email || `${user.first_name} ${user.last_name}`}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role || 'PLAYER'}</Badge>
                      </TableCell>
                      <TableCell>{user.team?.name || 'No team'}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <StatsQueueManager />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="export_leagues">Export Leagues</Label>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => handleExportData('leagues')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div>
                  <Label htmlFor="import_leagues">Import Leagues</Label>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => handleImportData('leagues')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
                <div>
                  <Label htmlFor="export_teams">Export Teams</Label>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => handleExportData('teams')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div>
                  <Label htmlFor="import_teams">Import Teams</Label>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => handleImportData('teams')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brand_logo">Logo URL</Label>
                <Input
                  id="brand_logo"
                  value={branding.logo_url}
                  onChange={(e) => setBranding({...branding, logo_url: e.target.value})}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={branding.primary_color}
                      onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={branding.primary_color}
                      onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={branding.secondary_color}
                      onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={branding.secondary_color}
                      onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <Button>
                <Palette className="h-4 w-4 mr-2" />
                Save Branding
              </Button>
            </CardContent>
          </Card>

          {/* Logo Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LogoPreview />
            </CardContent>
          </Card>

          {/* Logo Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LogoUpload onUploadComplete={() => {
                // Refresh logos list if needed
                console.log('Logo upload completed');
              }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
