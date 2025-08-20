import { useState, useEffect, useCallback } from 'react';
import { useAuthSession } from '@/lib/utils/auth-utils';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  skip?: boolean;
}

export function useApi<T>(
  endpoint: string,
  options: ApiOptions = {}
): ApiResponse<T> {
  const { session } = useAuthSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (options.skip || !session) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint, options, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Specialized hooks for common API calls
export function useLeagues() {
  return useApi<Array<any>>('/leagues');
}

export function useLeague(id: string) {
  return useApi<any>(`/leagues/${id}`);
}

export function useTeams(leagueId?: string) {
  const query = leagueId ? `?league_id=${leagueId}` : '';
  return useApi<Array<any>>(`/teams${query}`);
}

export function useTeam(id: string) {
  return useApi<any>(`/teams/${id}`);
}

export function usePlayers(teamId?: string) {
  const query = teamId ? `?team_id=${teamId}` : '';
  return useApi<Array<any>>(`/players${query}`);
}

export function useGames(seasonId?: string) {
  const query = seasonId ? `?season_id=${seasonId}` : '';
  return useApi<Array<any>>(`/games${query}`);
}

export function useStandings(seasonId: string) {
  return useApi<any>(`/standings?season_id=${seasonId}`);
}

export function useGameStats(gameId?: string) {
  const query = gameId ? `?game_id=${gameId}` : '';
  return useApi<Array<any>>(`/stats${query}`);
}

// Mutation hooks for creating/updating data
export function useCreateLeague() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLeague = useCallback(async (leagueData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leagueData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error creating league:', err);
      setError(err instanceof Error ? err.message : 'Failed to create league');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createLeague, loading, error };
}

export function useCreateTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = useCallback(async (teamData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error creating team:', err);
      setError(err instanceof Error ? err.message : 'Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTeam, loading, error };
}

export function useCreatePlayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlayer = useCallback(async (playerData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error creating player:', err);
      setError(err instanceof Error ? err.message : 'Failed to create player');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPlayer, loading, error };
}

export function useCreateGame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = useCallback(async (gameData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error creating game:', err);
      setError(err instanceof Error ? err.message : 'Failed to create game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGame, loading, error };
}

export function useCreateGameStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGameStats = useCallback(async (statsData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statsData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error creating game stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to create game stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGameStats, loading, error };
}
