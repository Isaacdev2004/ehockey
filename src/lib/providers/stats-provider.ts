// StatsProvider Interface
export interface GameStats {
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

export interface StatsProvider {
  name: string;
  description: string;
  isAvailable: boolean;
  
  // Fetch stats for a specific game
  getGameStats(gameId: string): Promise<GameStats[]>;
  
  // Fetch stats for a player across multiple games
  getPlayerStats(playerId: string, seasonId?: string): Promise<GameStats[]>;
  
  // Fetch stats for a team across multiple games
  getTeamStats(teamId: string, seasonId?: string): Promise<GameStats[]>;
  
  // Validate connection/credentials
  validateConnection(): Promise<boolean>;
}

// Manual Stats Provider (for manual entry)
export class ManualStatsProvider implements StatsProvider {
  name = 'Manual Entry';
  description = 'Manually enter game statistics';
  isAvailable = true;

  async getGameStats(gameId: string): Promise<GameStats[]> {
    // This would typically fetch from the database
    // For now, return empty array as this is handled by the API
    return [];
  }

  async getPlayerStats(playerId: string, seasonId?: string): Promise<GameStats[]> {
    // This would typically fetch from the database
    // For now, return empty array as this is handled by the API
    return [];
  }

  async getTeamStats(teamId: string, seasonId?: string): Promise<GameStats[]> {
    // This would typically fetch from the database
    // For now, return empty array as this is handled by the API
    return [];
  }

  async validateConnection(): Promise<boolean> {
    // Manual entry is always available
    return true;
  }

  // Manual entry specific methods
  async createGameStats(stats: GameStats): Promise<GameStats> {
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });

    if (!response.ok) {
      throw new Error('Failed to create game stats');
    }

    const result = await response.json();
    return result.data;
  }

  async updateGameStats(statsId: string, stats: Partial<GameStats>): Promise<GameStats> {
    const response = await fetch(`/api/stats/${statsId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });

    if (!response.ok) {
      throw new Error('Failed to update game stats');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteGameStats(statsId: string): Promise<void> {
    const response = await fetch(`/api/stats/${statsId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete game stats');
    }
  }
}

// EA Sports Stats Provider (integrated with NAHA scraper)
export class EAStatsProvider implements StatsProvider {
  name = 'EA Sports NHL';
  description = 'Import statistics from EA Sports NHL games via NAHA API';
  isAvailable = true; // Now available with the scraper integration

  private baseUrl = "https://proclubs.ea.com/api/nhl";
  private platform = "common-gen5";
  private headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml',
    'Accept-Language': 'en-US,en',
    'Accept-Encoding': 'gzip, deflate, br',
    'Content-Type': 'application/json',
    'Connection': 'keep-alive'
  };

  // Club IDs to track - these should be configurable
  private clubIds: number[] = [3383, 4388, 490, 765]; // Default from scraper

  constructor(clubIds?: number[]) {
    if (clubIds) {
      this.clubIds = clubIds;
    }
  }

  async getGameStats(gameId: string): Promise<GameStats[]> {
    if (!this.isAvailable) {
      throw new Error('EA Sports integration is not available');
    }

    try {
      // Fetch match data from EA Sports API
      const matchData = await this.fetchMatchData(gameId);
      if (!matchData) {
        throw new Error(`Game ${gameId} not found`);
      }

      return this.convertEAMatchToGameStats(matchData);
    } catch (error) {
      console.error('Failed to fetch game stats from EA Sports:', error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string, seasonId?: string): Promise<GameStats[]> {
    if (!this.isAvailable) {
      throw new Error('EA Sports integration is not available');
    }

    try {
      // Fetch all matches for the clubs we're tracking
      const allMatches = await this.fetchAllMatches();
      const playerStats: GameStats[] = [];

      for (const match of allMatches) {
        const matchStats = this.convertEAMatchToGameStats(match);
        const playerMatchStats = matchStats.filter(stat => stat.player_id === playerId);
        playerStats.push(...playerMatchStats);
      }

      return playerStats;
    } catch (error) {
      console.error('Failed to fetch player stats from EA Sports:', error);
      throw error;
    }
  }

  async getTeamStats(teamId: string, seasonId?: string): Promise<GameStats[]> {
    if (!this.isAvailable) {
      throw new Error('EA Sports integration is not available');
    }

    try {
      // Fetch all matches for the clubs we're tracking
      const allMatches = await this.fetchAllMatches();
      const teamStats: GameStats[] = [];

      for (const match of allMatches) {
        const matchStats = this.convertEAMatchToGameStats(match);
        const teamMatchStats = matchStats.filter(stat => stat.team_id === teamId);
        teamStats.push(...teamMatchStats);
      }

      return teamStats;
    } catch (error) {
      console.error('Failed to fetch team stats from EA Sports:', error);
      throw error;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Test the API with a simple request
      const testUrl = `${this.baseUrl}/clubs/matches?clubIds=${this.clubIds[0] || 3383}&platform=${this.platform}&matchType=club_private`;
      const response = await fetch(testUrl, {
        headers: this.headers,
        method: 'GET'
      });
      
      return response.ok;
    } catch (error) {
      console.error('EA Sports connection validation failed:', error);
      return false;
    }
  }

  // Helper methods for EA Sports integration
  private async fetchMatchData(matchId: string): Promise<any> {
    try {
      // For now, we'll fetch all matches and find the specific one
      const allMatches = await this.fetchAllMatches();
      return allMatches.find((match: any) => match.matchId === matchId) || null;
    } catch (error) {
      console.error('Failed to fetch match data:', error);
      return null;
    }
  }

  private async fetchAllMatches(): Promise<any[]> {
    const matches: any[] = [];

    for (const clubId of this.clubIds) {
      try {
        const url = `${this.baseUrl}/clubs/matches?clubIds=${clubId}&platform=${this.platform}&matchType=club_private`;
        const response = await fetch(url, {
          headers: this.headers,
          method: 'GET'
        });

        if (!response.ok) {
          console.warn(`Failed to fetch matches for club ${clubId}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        matches.push(...data);
      } catch (error) {
        console.error(`Error fetching matches for club ${clubId}:`, error);
      }
    }

    return matches;
  }

  private convertEAMatchToGameStats(match: any): GameStats[] {
    const gameStats: GameStats[] = [];

    // Convert player stats from EA format to our format
    if (match.players) {
      for (const clubId in match.players) {
        const players = match.players[clubId];
        
        for (const playerId in players) {
          const player = players[playerId];
          
          const stats: GameStats = {
            game_id: match.matchId,
            player_id: playerId,
            team_id: clubId,
            goals: player.goals || 0,
            assists: player.assists || 0,
            points: player.points || 0,
            shots: player.shots || 0,
            time_on_ice: player.timeOnIce || 0,
            penalty_minutes: player.penaltyMinutes || 0,
            plus_minus: player.plusMinus || 0,
          };

          // Add goalie-specific stats if available
          if (player.saves !== undefined) {
            stats.saves = player.saves;
            stats.goals_against = player.goalsAgainst || 0;
          }

          gameStats.push(stats);
        }
      }
    }

    return gameStats;
  }

  // EA Sports specific methods
  async importGameFromEA(eaGameId: string): Promise<GameStats[]> {
    if (!this.isAvailable) {
      throw new Error('EA Sports integration is not available');
    }

    const gameStats = await this.getGameStats(eaGameId);
    
    // Save to our database
    for (const stats of gameStats) {
      await this.saveGameStats(stats);
    }

    return gameStats;
  }

  async syncPlayerWithEA(playerId: string, eaPlayerId: string): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('EA Sports integration is not available');
    }

    // This would link our player records with EA Sports player IDs
    // Implementation depends on how you want to handle player mapping
    console.log(`Syncing player ${playerId} with EA player ${eaPlayerId}`);
  }

  async getEAGameSchedule(seasonId: string): Promise<any[]> {
    if (!this.isAvailable) {
      throw new Error('EA Sports integration is not available');
    }

    return await this.fetchAllMatches();
  }

  private async saveGameStats(stats: GameStats): Promise<void> {
    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      });

      if (!response.ok) {
        throw new Error('Failed to save game stats');
      }
    } catch (error) {
      console.error('Failed to save game stats:', error);
      throw error;
    }
  }

  // Configuration methods
  setClubIds(clubIds: number[]): void {
    this.clubIds = clubIds;
  }

  addClubId(clubId: number): void {
    if (!this.clubIds.includes(clubId)) {
      this.clubIds.push(clubId);
    }
  }

  removeClubId(clubId: number): void {
    this.clubIds = this.clubIds.filter(id => id !== clubId);
  }

  getClubIds(): number[] {
    return [...this.clubIds];
  }
}

// Stats Provider Factory
export class StatsProviderFactory {
  private static providers: Map<string, StatsProvider> = new Map();

  static registerProvider(name: string, provider: StatsProvider): void {
    this.providers.set(name, provider);
  }

  static getProvider(name: string): StatsProvider | undefined {
    return this.providers.get(name);
  }

  static getAvailableProviders(): StatsProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isAvailable);
  }

  static getDefaultProvider(): StatsProvider {
    // Return manual provider as default
    return this.providers.get('manual') || new ManualStatsProvider();
  }
}

// Initialize default providers
StatsProviderFactory.registerProvider('manual', new ManualStatsProvider());
StatsProviderFactory.registerProvider('ea', new EAStatsProvider());

// Export convenience functions
export const getStatsProvider = (name: string) => StatsProviderFactory.getProvider(name);
export const getAvailableStatsProviders = () => StatsProviderFactory.getAvailableProviders();
export const getDefaultStatsProvider = () => StatsProviderFactory.getDefaultProvider();
