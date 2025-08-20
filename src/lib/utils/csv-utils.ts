import Papa from 'papaparse';

// CSV Export Functions
export function exportToCSV<T>(data: T[], filename: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// CSV Import Functions
export function parseCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data as T[]);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

// Data Transformers for specific entities
export interface LeagueCSV {
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  logo_url?: string;
}

export interface TeamCSV {
  name: string;
  abbreviation: string;
  league_id: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
}

export interface PlayerCSV {
  first_name: string;
  last_name: string;
  handle: string;
  position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  number?: number;
  team_id?: string;
  is_active: boolean;
}

export interface GameCSV {
  season_id: string;
  date: string;
  home_team_id: string;
  away_team_id: string;
  venue?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface GameStatsCSV {
  game_id: string;
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

// Export functions for specific data types
export function exportLeagues(leagues: any[]): void {
  const csvData = leagues.map(league => ({
    name: league.name,
    description: league.description || '',
    status: league.status,
    logo_url: league.logo_url || ''
  }));
  exportToCSV(csvData, 'leagues');
}

export function exportTeams(teams: any[]): void {
  const csvData = teams.map(team => ({
    name: team.name,
    abbreviation: team.abbreviation,
    league_id: team.league_id,
    primary_color: team.colors?.primary || '',
    secondary_color: team.colors?.secondary || '',
    logo_url: team.logo_url || ''
  }));
  exportToCSV(csvData, 'teams');
}

export function exportPlayers(players: any[]): void {
  const csvData = players.map(player => ({
    first_name: player.first_name,
    last_name: player.last_name,
    handle: player.handle,
    position: player.position,
    number: player.number || '',
    team_id: player.team_id || '',
    is_active: player.is_active
  }));
  exportToCSV(csvData, 'players');
}

export function exportGames(games: any[]): void {
  const csvData = games.map(game => ({
    season_id: game.season_id,
    date: game.date,
    home_team_id: game.home_team_id,
    away_team_id: game.away_team_id,
    venue: game.venue || '',
    status: game.status,
    notes: game.notes || ''
  }));
  exportToCSV(csvData, 'games');
}

export function exportGameStats(stats: any[]): void {
  const csvData = stats.map(stat => ({
    game_id: stat.game_id,
    player_id: stat.player_id,
    team_id: stat.team_id,
    goals: stat.goals,
    assists: stat.assists,
    points: stat.points,
    shots: stat.shots,
    time_on_ice: stat.time_on_ice,
    penalty_minutes: stat.penalty_minutes,
    plus_minus: stat.plus_minus,
    saves: stat.saves || '',
    goals_against: stat.goals_against || ''
  }));
  exportToCSV(csvData, 'game_stats');
}

// Import functions for specific data types
export async function importLeagues(file: File): Promise<LeagueCSV[]> {
  return parseCSV<LeagueCSV>(file);
}

export async function importTeams(file: File): Promise<TeamCSV[]> {
  return parseCSV<TeamCSV>(file);
}

export async function importPlayers(file: File): Promise<PlayerCSV[]> {
  return parseCSV<PlayerCSV>(file);
}

export async function importGames(file: File): Promise<GameCSV[]> {
  return parseCSV<GameCSV>(file);
}

export async function importGameStats(file: File): Promise<GameStatsCSV[]> {
  return parseCSV<GameStatsCSV>(file);
}

// Validation functions
export function validateLeagueData(data: LeagueCSV[]): { valid: LeagueCSV[], invalid: { data: LeagueCSV, errors: string[] }[] } {
  const valid: LeagueCSV[] = [];
  const invalid: { data: LeagueCSV, errors: string[] }[] = [];

  data.forEach((row, index) => {
    const errors: string[] = [];
    
    if (!row.name || row.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (row.name && row.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }
    
    if (row.status && !['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(row.status)) {
      errors.push('Status must be ACTIVE, INACTIVE, or ARCHIVED');
    }
    
    if (errors.length > 0) {
      invalid.push({ data: row, errors });
    } else {
      valid.push(row);
    }
  });

  return { valid, invalid };
}

export function validateTeamData(data: TeamCSV[]): { valid: TeamCSV[], invalid: { data: TeamCSV, errors: string[] }[] } {
  const valid: TeamCSV[] = [];
  const invalid: { data: TeamCSV, errors: string[] }[] = [];

  data.forEach((row, index) => {
    const errors: string[] = [];
    
    if (!row.name || row.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!row.abbreviation || row.abbreviation.trim().length === 0) {
      errors.push('Abbreviation is required');
    }
    
    if (row.abbreviation && row.abbreviation.length > 10) {
      errors.push('Abbreviation must be less than 10 characters');
    }
    
    if (!row.league_id || row.league_id.trim().length === 0) {
      errors.push('League ID is required');
    }
    
    if (errors.length > 0) {
      invalid.push({ data: row, errors });
    } else {
      valid.push(row);
    }
  });

  return { valid, invalid };
}

export function validatePlayerData(data: PlayerCSV[]): { valid: PlayerCSV[], invalid: { data: PlayerCSV, errors: string[] }[] } {
  const valid: PlayerCSV[] = [];
  const invalid: { data: PlayerCSV, errors: string[] }[] = [];

  data.forEach((row, index) => {
    const errors: string[] = [];
    
    if (!row.first_name || row.first_name.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!row.last_name || row.last_name.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!row.handle || row.handle.trim().length === 0) {
      errors.push('Handle is required');
    }
    
    if (!row.position || !['C', 'LW', 'RW', 'D', 'G'].includes(row.position)) {
      errors.push('Position must be C, LW, RW, D, or G');
    }
    
    if (row.number && (row.number < 0 || row.number > 99)) {
      errors.push('Number must be between 0 and 99');
    }
    
    if (errors.length > 0) {
      invalid.push({ data: row, errors });
    } else {
      valid.push(row);
    }
  });

  return { valid, invalid };
}

// Utility function to create sample CSV templates
export function createSampleTemplate(type: 'leagues' | 'teams' | 'players' | 'games' | 'game_stats'): void {
  let sampleData: any[] = [];
  let filename = '';

  switch (type) {
    case 'leagues':
      sampleData = [
        { name: 'Sample League', description: 'A sample league', status: 'ACTIVE', logo_url: '' }
      ];
      filename = 'leagues_template';
      break;
    case 'teams':
      sampleData = [
        { name: 'Sample Team', abbreviation: 'ST', league_id: 'league-uuid', primary_color: '#1e40af', secondary_color: '#3b82f6', logo_url: '' }
      ];
      filename = 'teams_template';
      break;
    case 'players':
      sampleData = [
        { first_name: 'John', last_name: 'Doe', handle: 'johndoe', position: 'C', number: 91, team_id: 'team-uuid', is_active: true }
      ];
      filename = 'players_template';
      break;
    case 'games':
      sampleData = [
        { season_id: 'season-uuid', date: '2024-01-15T19:00:00Z', home_team_id: 'team-uuid', away_team_id: 'team-uuid-2', venue: 'Arena', status: 'SCHEDULED', notes: '' }
      ];
      filename = 'games_template';
      break;
    case 'game_stats':
      sampleData = [
        { game_id: 'game-uuid', player_id: 'player-uuid', team_id: 'team-uuid', goals: 2, assists: 1, points: 3, shots: 5, time_on_ice: 1200, penalty_minutes: 0, plus_minus: 1, saves: '', goals_against: '' }
      ];
      filename = 'game_stats_template';
      break;
  }

  exportToCSV(sampleData, filename);
}
