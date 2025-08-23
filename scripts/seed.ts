import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../src/types/auth';
import 'dotenv/config';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create demo league
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .insert({
        name: 'EHockey Premier League',
        description: 'The premier hockey league for competitive players',
        logo_url: '/logo.png',
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (leagueError) {
      console.error('Error creating league:', leagueError);
      return;
    }

    console.log('✅ Created league:', league.name);

    // Create demo season
    const { data: season, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        league_id: league.id,
        name: 'S2025-Fall',
        start_date: '2025-09-01',
        end_date: '2025-12-31',
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (seasonError) {
      console.error('Error creating season:', seasonError);
      return;
    }

    console.log('✅ Created season:', season.name);

    // Create demo teams
    const teams = [
      { name: 'Red Dragons', abbreviation: 'RD', colors: '#FF0000' },
      { name: 'Blue Wolves', abbreviation: 'BW', colors: '#0000FF' },
      { name: 'Green Sharks', abbreviation: 'GS', colors: '#00FF00' },
      { name: 'Yellow Tigers', abbreviation: 'YT', colors: '#FFFF00' }
    ];

    const createdTeams = [];
    for (const team of teams) {
      const { data: createdTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          league_id: league.id,
          name: team.name,
          abbreviation: team.abbreviation,
          colors: team.colors
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        continue;
      }

      createdTeams.push(createdTeam);
      console.log('✅ Created team:', team.name);
    }

    // Create demo players
    const playerNames = [
      'Alex Johnson', 'Sam Wilson', 'Jordan Smith', 'Casey Brown',
      'Taylor Davis', 'Morgan Lee', 'Riley Garcia', 'Skyler Martinez',
      'Charlie Rodriguez', 'Drew Lopez', 'Cameron Gonzalez', 'Avery Perez',
      'Reese Taylor', 'Hayden Anderson', 'Parker Thomas', 'Rowan Jackson',
      'Logan White', 'Aiden Harris', 'Mason Martin', 'Ethan Thompson',
      'Lucas Garcia', 'Jack Martinez', 'Henry Robinson', 'David Clark'
    ];

    const createdPlayers = [];
    for (let i = 0; i < playerNames.length; i++) {
      const player = playerNames[i];
      const teamIndex = Math.floor(i / 6); // 6 players per team

      const { data: createdPlayer, error: playerError } = await supabase
        .from('players')
        .insert({
          name: player,
          position: ['Forward', 'Defense', 'Goalie'][Math.floor(Math.random() * 3)],
          number: Math.floor(Math.random() * 99) + 1
        })
        .select()
        .single();

      if (playerError) {
        console.error('Error creating player:', playerError);
        continue;
      }

      createdPlayers.push({ ...createdPlayer, team_id: createdTeams[teamIndex]?.id });
      console.log(`✅ Created player: ${player} (Team: ${createdTeams[teamIndex]?.name})`);
    }

    // Create roster entries
    for (const player of createdPlayers) {
      if (player.team_id) {
        await supabase
          .from('rosters')
          .insert({
            season_id: season.id,
            team_id: player.team_id,
            player_id: player.id,
            role: Math.random() > 0.8 ? 'C' : Math.random() > 0.8 ? 'A' : null
          });
      }
    }

    // Create demo games
    const games = [
      { home_team_id: createdTeams[0].id, away_team_id: createdTeams[1].id, scheduled_date: '2025-09-15', status: 'COMPLETED' },
      { home_team_id: createdTeams[2].id, away_team_id: createdTeams[3].id, scheduled_date: '2025-09-22', status: 'COMPLETED' },
      { home_team_id: createdTeams[0].id, away_team_id: createdTeams[2].id, scheduled_date: '2025-09-29', status: 'SCHEDULED' },
      { home_team_id: createdTeams[1].id, away_team_id: createdTeams[3].id, scheduled_date: '2025-10-06', status: 'SCHEDULED' }
    ];

    const createdGames = [];
    for (const game of games) {
      const { data: createdGame, error: gameError } = await supabase
        .from('games')
        .insert({
          season_id: season.id,
          home_team_id: game.home_team_id,
          away_team_id: game.away_team_id,
          scheduled_date: game.scheduled_date,
          status: game.status
        })
        .select()
        .single();

      if (gameError) {
        console.error('Error creating game:', gameError);
        continue;
      }

      createdGames.push(createdGame);
      console.log(`✅ Created game: ${createdGame.home_team_id} vs ${createdGame.away_team_id}`);
    }

    // Add stats for completed games
    const completedGames = createdGames.filter(g => g.status === 'COMPLETED');
    for (const game of completedGames) {
      const homeTeamPlayers = createdPlayers.filter(p => p.team_id === game.home_team_id);
      const awayTeamPlayers = createdPlayers.filter(p => p.team_id === game.away_team_id);

      // Add stats for home team players
      for (const player of homeTeamPlayers.slice(0, 5)) {
        await supabase
          .from('game_stats')
          .insert({
            game_id: game.id,
            player_id: player.id,
            goals: Math.floor(Math.random() * 3),
            assists: Math.floor(Math.random() * 3),
            points: 0, // Will be calculated as goals + assists
            shots: Math.floor(Math.random() * 10) + 5,
            hits: Math.floor(Math.random() * 8) + 2,
            blocked_shots: Math.floor(Math.random() * 5),
            penalty_minutes: Math.floor(Math.random() * 10),
            time_on_ice: `${Math.floor(Math.random() * 20) + 10}:00`
          });
      }

      // Add stats for away team players
      for (const player of awayTeamPlayers.slice(0, 5)) {
        await supabase
          .from('game_stats')
          .insert({
            game_id: game.id,
            player_id: player.id,
            goals: Math.floor(Math.random() * 3),
            assists: Math.floor(Math.random() * 3),
            points: 0, // Will be calculated as goals + assists
            shots: Math.floor(Math.random() * 10) + 5,
            hits: Math.floor(Math.random() * 8) + 2,
            blocked_shots: Math.floor(Math.random() * 5),
            penalty_minutes: Math.floor(Math.random() * 10),
            time_on_ice: `${Math.floor(Math.random() * 20) + 10}:00`
          });
      }
    }

    // Create demo users with different roles
    const demoUsers = [
      {
        email: 'player@ehockey.net',
        role: UserRole.PLAYER,
        team_id: createdTeams[0].id
      },
      {
        email: 'manager@ehockey.net',
        role: UserRole.MANAGER,
        team_id: createdTeams[1].id
      },
      {
        email: 'admin@ehockey.net',
        role: UserRole.ADMIN
      }
    ];

    for (const user of demoUsers) {
      // Create Supabase Auth user first
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'password123',
        email_confirm: true // Auto-confirm email for demo
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      // Create account record linked to auth user
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          id: authUser.user.id, // Link to auth user ID
          email: user.email,
          role: user.role,
          team_id: user.team_id,
          is_active: true
        });

      if (accountError) {
        console.error(`Error creating account for ${user.email}:`, accountError);
        continue;
      }

      console.log(`✅ Created demo ${user.role.toLowerCase()} user:`, user.email);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`- 1 League: ${league.name}`);
    console.log(`- 1 Season: ${season.name}`);
    console.log(`- 4 Teams: ${teams.map(t => t.name).join(', ')}`);
    console.log(`- 24 Players assigned to teams`);
    console.log(`- 4 Games (2 completed, 2 scheduled)`);
    console.log(`- 3 Demo users (player, manager, admin)`);
    console.log('\n🔑 Demo User Credentials:');
    console.log('- Player: player@ehockey.net');
    console.log('- Manager: manager@ehockey.net');
    console.log('- Admin: admin@ehockey.net');
    console.log('- Password for all: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();
