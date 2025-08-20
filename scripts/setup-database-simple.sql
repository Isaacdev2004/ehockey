-- EHockey League Database Schema Setup (Simplified Version)
-- This script can be run multiple times safely

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'PLAYER' CHECK (role IN ('PLAYER', 'MANAGER', 'ADMIN')),
    team_id UUID,
    league_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    owner_id UUID REFERENCES public.accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasons table
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    rules JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    abbreviation TEXT,
    colors JSONB DEFAULT '{}',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    handle TEXT,
    position TEXT DEFAULT 'C' CHECK (position IN ('C', 'LW', 'RW', 'D', 'G')),
    number INTEGER,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rosters table
CREATE TABLE IF NOT EXISTS public.rosters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'PLAYER' CHECK (role IN ('PLAYER', 'CAPTAIN', 'ASSISTANT_CAPTAIN')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, player_id, season_id)
);

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES public.teams(id),
    away_team_id UUID REFERENCES public.teams(id),
    date TIMESTAMP WITH TIME ZONE,
    venue TEXT,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_stats table
CREATE TABLE IF NOT EXISTS public.game_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id),
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    time_on_ice INTEGER DEFAULT 0, -- in seconds
    penalty_minutes INTEGER DEFAULT 0,
    plus_minus INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0, -- for goalies
    goals_against INTEGER DEFAULT 0, -- for goalies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, player_id)
);

-- Create logos table
CREATE TABLE IF NOT EXISTS public.logos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('league', 'team', 'sponsor')),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.accounts(id),
    is_active BOOLEAN DEFAULT true
);

-- Create stats_queue table
CREATE TABLE IF NOT EXISTS public.stats_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'manual' CHECK (provider IN ('ea_sports', 'manual')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_email ON public.accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_role ON public.accounts(role);
CREATE INDEX IF NOT EXISTS idx_accounts_team_id ON public.accounts(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_league_id ON public.teams(league_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_games_season_id ON public.games(season_id);
CREATE INDEX IF NOT EXISTS idx_games_home_team_id ON public.games(home_team_id);
CREATE INDEX IF NOT EXISTS idx_games_away_team_id ON public.games(away_team_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_game_id ON public.game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_player_id ON public.game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_rosters_team_id ON public.rosters(team_id);
CREATE INDEX IF NOT EXISTS idx_rosters_player_id ON public.rosters(player_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats_queue ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (allowing all access for demo purposes)
-- These can be customized later for production security

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access" ON public.leagues;
DROP POLICY IF EXISTS "Allow all access" ON public.teams;
DROP POLICY IF EXISTS "Allow all access" ON public.players;
DROP POLICY IF EXISTS "Allow all access" ON public.games;
DROP POLICY IF EXISTS "Allow all access" ON public.game_stats;
DROP POLICY IF EXISTS "Allow all access" ON public.seasons;
DROP POLICY IF EXISTS "Allow all access" ON public.rosters;
DROP POLICY IF EXISTS "Allow all access" ON public.logos;
DROP POLICY IF EXISTS "Allow all access" ON public.stats_queue;
DROP POLICY IF EXISTS "Allow all access" ON public.accounts;

-- Create simple policies that allow all access (for demo/testing)
CREATE POLICY "Allow all access" ON public.leagues FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.teams FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.players FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.games FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.game_stats FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.seasons FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.rosters FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.logos FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.stats_queue FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.accounts FOR ALL USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully!' as status;
