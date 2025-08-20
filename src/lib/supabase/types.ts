export type Database = {
    public: {
      Tables: {
        accounts: {
          Row: {
            id: string;
            updated_at: string;
            username: string | null;
            full_name: string | null;
            avatar_url: string | null;
            email: string;
            role: 'PLAYER' | 'MANAGER' | 'ADMIN';
            team_id: string | null;
            league_id: string | null;
            is_active: boolean;
            created_at: string;
          };
          Insert: {
            id: string;
            updated_at?: string;
            username?: string | null;
            full_name?: string | null;
            avatar_url?: string | null;
            email: string;
            role?: 'PLAYER' | 'MANAGER' | 'ADMIN';
            team_id?: string | null;
            league_id?: string | null;
            is_active?: boolean;
            created_at?: string;
          };
          Update: {
            id?: string;
            updated_at?: string;
            username?: string | null;
            full_name?: string | null;
            avatar_url?: string | null;
            email?: string;
            role?: 'PLAYER' | 'MANAGER' | 'ADMIN';
            team_id?: string | null;
            league_id?: string | null;
            is_active?: boolean;
            created_at?: string;
          };
        };
        leagues: {
          Row: {
            id: string;
            name: string;
            description: string | null;
            logo_url: string | null;
            status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
            owner_id: string;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            description?: string | null;
            logo_url?: string | null;
            status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
            owner_id: string;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            description?: string | null;
            logo_url?: string | null;
            status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
            owner_id?: string;
            created_at?: string;
            updated_at?: string;
          };
        };
        seasons: {
          Row: {
            id: string;
            league_id: string;
            name: string;
            start_date: string;
            end_date: string;
            status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
            rules: any;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            league_id: string;
            name: string;
            start_date: string;
            end_date: string;
            status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
            rules?: any;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            league_id?: string;
            name?: string;
            start_date?: string;
            end_date?: string;
            status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
            rules?: any;
            created_at?: string;
            updated_at?: string;
          };
        };
        teams: {
          Row: {
            id: string;
            league_id: string;
            name: string;
            abbreviation: string;
            colors: any;
            logo_url: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            league_id: string;
            name: string;
            abbreviation: string;
            colors?: any;
            logo_url?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            league_id?: string;
            name?: string;
            abbreviation?: string;
            colors?: any;
            logo_url?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
        players: {
          Row: {
            id: string;
            first_name: string;
            last_name: string;
            handle: string;
            position: string;
            number: number | null;
            team_id: string | null;
            is_active: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            first_name: string;
            last_name: string;
            handle: string;
            position: string;
            number?: number | null;
            team_id?: string | null;
            is_active?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            first_name?: string;
            last_name?: string;
            handle?: string;
            position?: string;
            number?: number | null;
            team_id?: string | null;
            is_active?: boolean;
            created_at?: string;
            updated_at?: string;
          };
        };
        rosters: {
          Row: {
            id: string;
            season_id: string;
            team_id: string;
            player_id: string;
            role: 'CAPTAIN' | 'ASSISTANT' | 'PLAYER';
            start_date: string;
            end_date: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            season_id: string;
            team_id: string;
            player_id: string;
            role?: 'CAPTAIN' | 'ASSISTANT' | 'PLAYER';
            start_date: string;
            end_date?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            season_id?: string;
            team_id?: string;
            player_id?: string;
            role?: 'CAPTAIN' | 'ASSISTANT' | 'PLAYER';
            start_date?: string;
            end_date?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
        games: {
          Row: {
            id: string;
            season_id: string;
            date: string;
            home_team_id: string;
            away_team_id: string;
            venue: string | null;
            status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
            notes: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            season_id: string;
            date: string;
            home_team_id: string;
            away_team_id: string;
            venue?: string | null;
            status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
            notes?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            season_id?: string;
            date?: string;
            home_team_id?: string;
            away_team_id?: string;
            venue?: string | null;
            status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
            notes?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
        game_stats: {
          Row: {
            id: string;
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
            saves: number | null;
            goals_against: number | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            game_id: string;
            player_id: string;
            team_id: string;
            goals?: number;
            assists?: number;
            points?: number;
            shots?: number;
            time_on_ice?: number;
            penalty_minutes?: number;
            plus_minus?: number;
            saves?: number | null;
            goals_against?: number | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            game_id?: string;
            player_id?: string;
            team_id?: string;
            goals?: number;
            assists?: number;
            points?: number;
            shots?: number;
            time_on_ice?: number;
            penalty_minutes?: number;
            plus_minus?: number;
            saves?: number | null;
            goals_against?: number | null;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  };