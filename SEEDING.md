# Database Seeding Guide

This guide explains how to seed the database with demo data for the EHockey League site.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Get your service role key (for seeding)

2. **Environment Variables**
   Create a `.env.local` file with the following variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

## Database Schema

The seed script will create the following tables and data:

### Tables Created
- `accounts` - User accounts with roles
- `leagues` - Hockey leagues
- `seasons` - League seasons
- `teams` - Teams within leagues
- `players` - Individual players
- `rosters` - Player-team-season relationships
- `games` - Scheduled and completed games
- `game_stats` - Individual player statistics per game

### Demo Data Created

#### 1 League
- **EHockey Premier League** - Active league with 4 teams

#### 1 Season
- **S2025-Fall** - Active season (Sep 1 - Dec 31, 2025)

#### 4 Teams
- **Thunder Hawks** (TH) - Blue colors
- **Ice Dragons** (ID) - Red colors  
- **Frost Giants** (FG) - Green colors
- **Storm Wolves** (SW) - Purple colors

#### 24 Players
- 6 players per team (including 1 goalie per team)
- Various positions: C, LW, RW, D, G
- Assigned jersey numbers and handles

#### 4 Games
- 2 completed games with full statistics
- 2 scheduled games
- Mix of home/away matchups

#### 3 Demo Users
- **Player**: `player@ehockey.net` (PLAYER role)
- **Manager**: `manager@ehockey.net` (MANAGER role)  
- **Admin**: `admin@ehockey.net` (ADMIN role)

## Running the Seed Script

### Option 1: Using npm script (Recommended)

1. Add the seed script to `package.json`:
   ```json
   {
     "scripts": {
       "seed": "tsx scripts/seed.ts"
     }
   }
   ```

2. Install tsx if not already installed:
   ```bash
   npm install -D tsx
   ```

3. Run the seed script:
   ```bash
   npm run seed
   ```

### Option 2: Direct execution

1. Install tsx:
   ```bash
   npm install -D tsx
   ```

2. Run the script directly:
   ```bash
   npx tsx scripts/seed.ts
   ```

### Option 3: Using Node.js

1. Compile the TypeScript:
   ```bash
   npx tsc scripts/seed.ts --outDir dist
   ```

2. Run the compiled JavaScript:
   ```bash
   node dist/scripts/seed.js
   ```

## Expected Output

When the seed script runs successfully, you should see output like:

```
🌱 Starting database seeding...
✅ Created demo league: EHockey Premier League
✅ Created demo season: S2025-Fall
✅ Created team: Thunder Hawks
✅ Created team: Ice Dragons
✅ Created team: Frost Giants
✅ Created team: Storm Wolves
✅ Created player: John Smith
✅ Created player: Mike Johnson
...
✅ Assigned John Smith to Thunder Hawks
✅ Assigned Mike Johnson to Thunder Hawks
...
✅ Created game: 2025-09-15T19:00:00Z - team-id vs team-id
✅ Created demo player user: player@ehockey.net
✅ Created demo manager user: manager@ehockey.net
✅ Created demo admin user: admin@ehockey.net
🎉 Database seeding completed successfully!

📋 Demo Data Summary:
- 1 League: EHockey Premier League
- 1 Season: S2025-Fall
- 4 Teams: Thunder Hawks, Ice Dragons, Frost Giants, Storm Wolves
- 24 Players assigned to teams
- 4 Games (2 completed, 2 scheduled)
- 3 Demo users (player, manager, admin)

🔑 Demo User Credentials:
- Player: player@ehockey.net
- Manager: manager@ehockey.net
- Admin: admin@ehockey.net
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure all required environment variables are set in `.env.local`
   - Double-check the Supabase URL and keys

2. **Permission Errors**
   - Make sure you're using the service role key, not the anon key
   - Verify your Supabase project has the correct RLS policies

3. **Table Already Exists**
   - The script will handle existing data gracefully
   - If you need to start fresh, clear the database first

4. **TypeScript Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check that the import paths are correct

### Resetting the Database

To start fresh:

1. **Clear all data** (in Supabase dashboard):
   ```sql
   TRUNCATE TABLE game_stats, rosters, games, players, teams, seasons, leagues, accounts CASCADE;
   ```

2. **Run the seed script again**:
   ```bash
   npm run seed
   ```

## Next Steps

After seeding:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the application**:
   - Visit `http://localhost:3000`
   - Try logging in with demo credentials
   - Navigate through different role-based panels

3. **Verify functionality**:
   - Check that all panels load correctly
   - Verify role-based access control works
   - Test the demo data displays properly

## Customization

To customize the demo data:

1. **Modify the seed script** (`scripts/seed.ts`)
2. **Update team names, colors, and logos**
3. **Add more players or games**
4. **Change user credentials**

Remember to update the script documentation if you make significant changes.
