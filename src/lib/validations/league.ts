import { z } from 'zod';

// League validation schema
export const createLeagueSchema = z.object({
  name: z.string().min(1, 'League name is required').max(100, 'League name must be less than 100 characters'),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const updateLeagueSchema = createLeagueSchema.partial();

export const leagueIdSchema = z.object({
  id: z.string().uuid('Invalid league ID'),
});

// Season validation schema
export const createSeasonSchema = z.object({
  league_id: z.string().uuid('Invalid league ID'),
  name: z.string().min(1, 'Season name is required').max(50, 'Season name must be less than 50 characters'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).default('UPCOMING'),
  rules: z.object({
    points: z.object({
      win: z.number().min(0).max(10),
      otLoss: z.number().min(0).max(5),
      loss: z.number().min(0).max(5),
    }),
    tiebreakers: z.array(z.enum([
      'points',
      'regulationWins', 
      'goalDifferential',
      'headToHead',
      'goalsFor'
    ])),
  }).optional(),
});

export const updateSeasonSchema = createSeasonSchema.partial();

export const seasonIdSchema = z.object({
  id: z.string().uuid('Invalid season ID'),
});

// Team validation schema
export const createTeamSchema = z.object({
  league_id: z.string().uuid('Invalid league ID'),
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must be less than 100 characters'),
  abbreviation: z.string().min(1, 'Abbreviation is required').max(10, 'Abbreviation must be less than 10 characters'),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color'),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Secondary color must be a valid hex color'),
  }).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
});

export const updateTeamSchema = createTeamSchema.partial();

export const teamIdSchema = z.object({
  id: z.string().uuid('Invalid team ID'),
});

// Player validation schema
export const createPlayerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  handle: z.string().min(1, 'Handle is required').max(30, 'Handle must be less than 30 characters'),
  position: z.enum(['C', 'LW', 'RW', 'D', 'G'], {
    errorMap: () => ({ message: 'Position must be C, LW, RW, D, or G' }),
  }),
  number: z.number().min(0).max(99).optional(),
  team_id: z.string().uuid('Invalid team ID').optional(),
  is_active: z.boolean().default(true),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export const playerIdSchema = z.object({
  id: z.string().uuid('Invalid player ID'),
});

// Roster validation schema
export const createRosterSchema = z.object({
  season_id: z.string().uuid('Invalid season ID'),
  team_id: z.string().uuid('Invalid team ID'),
  player_id: z.string().uuid('Invalid player ID'),
  role: z.enum(['CAPTAIN', 'ASSISTANT', 'PLAYER']).default('PLAYER'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date').optional(),
});

export const updateRosterSchema = createRosterSchema.partial();

export const rosterIdSchema = z.object({
  id: z.string().uuid('Invalid roster ID'),
});

// Game validation schema
export const createGameSchema = z.object({
  season_id: z.string().uuid('Invalid season ID'),
  date: z.string().datetime('Invalid game date'),
  home_team_id: z.string().uuid('Invalid home team ID'),
  away_team_id: z.string().uuid('Invalid away team ID'),
  venue: z.string().max(100, 'Venue must be less than 100 characters').optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const updateGameSchema = createGameSchema.partial();

export const gameIdSchema = z.object({
  id: z.string().uuid('Invalid game ID'),
});

// Game Stats validation schema
export const createGameStatsSchema = z.object({
  game_id: z.string().uuid('Invalid game ID'),
  player_id: z.string().uuid('Invalid player ID'),
  team_id: z.string().uuid('Invalid team ID'),
  goals: z.number().min(0).max(20, 'Goals must be between 0 and 20'),
  assists: z.number().min(0).max(20, 'Assists must be between 0 and 20'),
  points: z.number().min(0).max(40, 'Points must be between 0 and 40'),
  shots: z.number().min(0).max(50, 'Shots must be between 0 and 50'),
  time_on_ice: z.number().min(0).max(3600, 'Time on ice must be between 0 and 3600 seconds'),
  penalty_minutes: z.number().min(0).max(60, 'Penalty minutes must be between 0 and 60'),
  plus_minus: z.number().min(-10).max(10, 'Plus/minus must be between -10 and 10'),
  saves: z.number().min(0).max(100, 'Saves must be between 0 and 100').optional(),
  goals_against: z.number().min(0).max(20, 'Goals against must be between 0 and 20').optional(),
});

export const updateGameStatsSchema = createGameStatsSchema.partial();

export const gameStatsIdSchema = z.object({
  id: z.string().uuid('Invalid game stats ID'),
});

// Query parameters for filtering and pagination
export const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  team_id: z.string().uuid().optional(),
  season_id: z.string().uuid().optional(),
});

// Export types for use in API routes
export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type UpdateLeagueInput = z.infer<typeof updateLeagueSchema>;
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type CreateGameStatsInput = z.infer<typeof createGameStatsSchema>;
export type UpdateGameStatsInput = z.infer<typeof updateGameStatsSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;
