import { createClient } from '@supabase/supabase-js';

// Types for automated stats processing
export interface GameStatsData {
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
  source: 'EA_SPORTS' | 'MANUAL';
  processed_at: string;
}

export interface StatsQueueItem {
  id: string;
  game_id: string;
  stats_data: GameStatsData[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  processed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

export interface EASportsGameData {
  game_id: string;
  home_team_score: number;
  away_team_score: number;
  period: number;
  time_remaining: string;
  player_stats: {
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
  }[];
}

// Stats Provider Interface
export interface StatsProvider {
  name: string;
  description: string;
  isAvailable: boolean;
  
  // Fetch stats for a specific game
  getGameStats(gameId: string): Promise<GameStatsData[]>;
  
  // Fetch stats for a player across multiple games
  getPlayerStats(playerId: string, seasonId?: string): Promise<GameStatsData[]>;
  
  // Fetch stats for a team across multiple games
  getTeamStats(teamId: string, seasonId?: string): Promise<GameStatsData[]>;
  
  // Validate connection/credentials
  validateConnection(): Promise<boolean>;
  
  // Process multiple games in batch
  processBatch(gameIds: string[]): Promise<GameStatsData[]>;
}

// EA Sports Stats Provider (Primary)
export class EASportsStatsProvider implements StatsProvider {
  name = 'EA Sports NHL';
  description = 'Automated statistics from EA Sports NHL games';
  isAvailable = true;
  private supabase: any;
  private apiKey?: string;
  private baseUrl?: string;

  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // EA Sports API configuration
    this.apiKey = process.env.EA_SPORTS_API_KEY;
    this.baseUrl = process.env.EA_SPORTS_API_URL;
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Test connection to EA Sports API
      if (!this.apiKey || !this.baseUrl) {
        console.warn('EA Sports API credentials not configured');
        return false;
      }

      // Simulate API connection test
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('EA Sports API connection failed:', error);
      return false;
    }
  }

  async getGameStats(gameId: string): Promise<GameStatsData[]> {
    try {
      // Fetch game data from EA Sports API
      const gameData = await this.fetchEASportsGameData(gameId);
      
      // Transform to our format
      return gameData.player_stats.map(player => ({
        game_id: gameId,
        player_id: player.player_id,
        team_id: player.team_id,
        goals: player.goals,
        assists: player.assists,
        points: player.points,
        shots: player.shots,
        time_on_ice: player.time_on_ice,
        penalty_minutes: player.penalty_minutes,
        plus_minus: player.plus_minus,
        saves: player.saves,
        goals_against: player.goals_against,
        source: 'EA_SPORTS' as const,
        processed_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error(`Error fetching EA Sports stats for game ${gameId}:`, error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string, seasonId?: string): Promise<GameStatsData[]> {
    try {
      // Fetch player stats from EA Sports API
      const response = await fetch(`${this.baseUrl}/players/${playerId}/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: seasonId ? JSON.stringify({ season_id: seasonId }) : undefined,
      });

      if (!response.ok) {
        throw new Error(`EA Sports API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform to our format
      return data.games.map((game: any) => ({
        game_id: game.game_id,
        player_id: playerId,
        team_id: game.team_id,
        goals: game.goals,
        assists: game.assists,
        points: game.points,
        shots: game.shots,
        time_on_ice: game.time_on_ice,
        penalty_minutes: game.penalty_minutes,
        plus_minus: game.plus_minus,
        saves: game.saves,
        goals_against: game.goals_against,
        source: 'EA_SPORTS' as const,
        processed_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error(`Error fetching EA Sports player stats for ${playerId}:`, error);
      throw error;
    }
  }

  async getTeamStats(teamId: string, seasonId?: string): Promise<GameStatsData[]> {
    try {
      // Fetch team stats from EA Sports API
      const response = await fetch(`${this.baseUrl}/teams/${teamId}/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: seasonId ? JSON.stringify({ season_id: seasonId }) : undefined,
      });

      if (!response.ok) {
        throw new Error(`EA Sports API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform to our format
      return data.games.flatMap((game: any) => 
        game.player_stats.map((player: any) => ({
          game_id: game.game_id,
          player_id: player.player_id,
          team_id: teamId,
          goals: player.goals,
          assists: player.assists,
          points: player.points,
          shots: player.shots,
          time_on_ice: player.time_on_ice,
          penalty_minutes: player.penalty_minutes,
          plus_minus: player.plus_minus,
          saves: player.saves,
          goals_against: player.goals_against,
          source: 'EA_SPORTS' as const,
          processed_at: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error(`Error fetching EA Sports team stats for ${teamId}:`, error);
      throw error;
    }
  }

  async processBatch(gameIds: string[]): Promise<GameStatsData[]> {
    const allStats: GameStatsData[] = [];
    
    for (const gameId of gameIds) {
      try {
        const gameStats = await this.getGameStats(gameId);
        allStats.push(...gameStats);
      } catch (error) {
        console.error(`Failed to process game ${gameId}:`, error);
        // Continue with other games even if one fails
      }
    }
    
    return allStats;
  }

  private async fetchEASportsGameData(gameId: string): Promise<EASportsGameData> {
    // Simulate EA Sports API call
    // In real implementation, this would call the actual EA Sports API
    const response = await fetch(`${this.baseUrl}/games/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`EA Sports API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Manual Stats Provider (Fallback)
export class ManualStatsProvider implements StatsProvider {
  name = 'Manual Entry';
  description = 'Manually enter game statistics';
  isAvailable = true;
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async validateConnection(): Promise<boolean> {
    // Manual provider is always available
    return true;
  }

  async getGameStats(gameId: string): Promise<GameStatsData[]> {
    try {
      const { data, error } = await this.supabase
        .from('game_stats')
        .select('*')
        .eq('game_id', gameId)
        .eq('source', 'MANUAL');

      if (error) {
        throw error;
      }

      return data.map((stat: any) => ({
        ...stat,
        source: 'MANUAL' as const,
      }));
    } catch (error) {
      console.error(`Error fetching manual stats for game ${gameId}:`, error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string, seasonId?: string): Promise<GameStatsData[]> {
    try {
      let query = this.supabase
        .from('game_stats')
        .select('*')
        .eq('player_id', playerId)
        .eq('source', 'MANUAL');

      if (seasonId) {
        query = query.eq('season_id', seasonId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map((stat: any) => ({
        ...stat,
        source: 'MANUAL' as const,
      }));
    } catch (error) {
      console.error(`Error fetching manual player stats for ${playerId}:`, error);
      throw error;
    }
  }

  async getTeamStats(teamId: string, seasonId?: string): Promise<GameStatsData[]> {
    try {
      let query = this.supabase
        .from('game_stats')
        .select('*')
        .eq('team_id', teamId)
        .eq('source', 'MANUAL');

      if (seasonId) {
        query = query.eq('season_id', seasonId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map((stat: any) => ({
        ...stat,
        source: 'MANUAL' as const,
      }));
    } catch (error) {
      console.error(`Error fetching manual team stats for ${teamId}:`, error);
      throw error;
    }
  }

  async processBatch(gameIds: string[]): Promise<GameStatsData[]> {
    // Manual provider doesn't support batch processing
    throw new Error('Manual stats provider does not support batch processing');
  }
}

// Stats Queue Manager
export class StatsQueueManager {
  private supabase: any;
  private providers: Map<string, StatsProvider>;
  private processing = false;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.providers = new Map();
    this.providers.set('ea_sports', new EASportsStatsProvider());
    this.providers.set('manual', new ManualStatsProvider());
  }

  async addToQueue(gameIds: string[], providerName: string = 'ea_sports'): Promise<string[]> {
    const queueItems: StatsQueueItem[] = gameIds.map(gameId => ({
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      game_id: gameId,
      stats_data: [],
      status: 'PENDING',
      created_at: new Date().toISOString(),
      retry_count: 0,
      max_retries: 3,
    }));

    const { data, error } = await this.supabase
      .from('stats_queue')
      .insert(queueItems)
      .select('id');

    if (error) {
      throw new Error(`Failed to add items to queue: ${error.message}`);
    }

    return data.map((item: any) => item.id);
  }

  async processQueue(): Promise<void> {
    if (this.processing) {
      console.log('Queue processing already in progress');
      return;
    }

    this.processing = true;

    try {
      // Get pending items
      const { data: pendingItems, error } = await this.supabase
        .from('stats_queue')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })
        .limit(10); // Process 10 items at a time

      if (error) {
        throw error;
      }

      if (!pendingItems || pendingItems.length === 0) {
        console.log('No pending items in queue');
        return;
      }

      console.log(`Processing ${pendingItems.length} queue items`);

      for (const item of pendingItems) {
        await this.processQueueItem(item);
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.processing = false;
    }
  }

  private async processQueueItem(item: StatsQueueItem): Promise<void> {
    try {
      // Update status to processing
      await this.supabase
        .from('stats_queue')
        .update({ 
          status: 'PROCESSING',
          processed_at: new Date().toISOString()
        })
        .eq('id', item.id);

      // Get the EA Sports provider
      const provider = this.providers.get('ea_sports');
      if (!provider || !provider.isAvailable) {
        throw new Error('EA Sports provider not available');
      }

      // Fetch stats for the game
      const stats = await provider.getGameStats(item.game_id);

      // Save stats to database
      if (stats.length > 0) {
        const { error: saveError } = await this.supabase
          .from('game_stats')
          .insert(stats);

        if (saveError) {
          throw saveError;
        }
      }

      // Update queue item to completed
      await this.supabase
        .from('stats_queue')
        .update({ 
          status: 'COMPLETED',
          stats_data: stats
        })
        .eq('id', item.id);

      console.log(`Successfully processed game ${item.game_id}`);

    } catch (error) {
      console.error(`Error processing queue item ${item.id}:`, error);

      // Update retry count
      const newRetryCount = item.retry_count + 1;
      const status = newRetryCount >= item.max_retries ? 'FAILED' : 'PENDING';

      await this.supabase
        .from('stats_queue')
        .update({ 
          status,
          retry_count: newRetryCount,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', item.id);

      if (status === 'FAILED') {
        console.error(`Queue item ${item.id} failed after ${item.max_retries} retries`);
      }
    }
  }

  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const { data, error } = await this.supabase
      .from('stats_queue')
      .select('status');

    if (error) {
      throw error;
    }

    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    data.forEach((item: any) => {
      counts[item.status as keyof typeof counts]++;
    });

    return counts;
  }

  async clearCompletedItems(): Promise<void> {
    const { error } = await this.supabase
      .from('stats_queue')
      .delete()
      .eq('status', 'COMPLETED');

    if (error) {
      throw error;
    }
  }
}

// Export convenience functions
export const getStatsProvider = (name: string): StatsProvider | undefined => {
  const providers = new Map();
  providers.set('ea_sports', new EASportsStatsProvider());
  providers.set('manual', new ManualStatsProvider());
  return providers.get(name);
};

export const getAvailableStatsProviders = (): StatsProvider[] => {
  const providers = [
    new EASportsStatsProvider(),
    new ManualStatsProvider(),
  ];
  return providers.filter(p => p.isAvailable);
};

export const getDefaultStatsProvider = (): StatsProvider => {
  const eaProvider = new EASportsStatsProvider();
  return eaProvider.isAvailable ? eaProvider : new ManualStatsProvider();
};

export const createQueueManager = (): StatsQueueManager => {
  return new StatsQueueManager();
};
