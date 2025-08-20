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

    console.log('✅ Created demo league:', league.name);

    // Create demo season
    const { data: season, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        league_id: league.id,
        name: 'S2025-Fall',
        start_date: '2025-09-01',
        end_date: '2025-12-31',
        status: 'ACTIVE',
        rules: {
          points: {
            win: 2,
            otLoss: 1,
            loss: 0
          },
          tiebreakers: ['points', 'regulationWins', 'goalDifferential', 'headToHead', 'goalsFor']
        }
      })
      .select()
      .single();

    if (seasonError) {
      console.error('Error creating season:', seasonError);
      return;
    }

    console.log('✅ Created demo season:', season.name);

    // Create demo teams
    const teams = [
      {
        name: 'Thunder Hawks',
        abbreviation: 'TH',
        colors: { primary: '#1e40af', secondary: '#3b82f6' },
        logo_url: '/team-logos/thunder-hawks.png'
      },
      {
        name: 'Ice Dragons',
        abbreviation: 'ID',
        colors: { primary: '#dc2626', secondary: '#ef4444' },
        logo_url: '/team-logos/ice-dragons.png'
      },
      {
        name: 'Frost Giants',
        abbreviation: 'FG',
        colors: { primary: '#059669', secondary: '#10b981' },
        logo_url: '/team-logos/frost-giants.png'
      },
      {
        name: 'Storm Wolves',
        abbreviation: 'SW',
        colors: { primary: '#7c3aed', secondary: '#8b5cf6' },
        logo_url: '/team-logos/storm-wolves.png'
      }
    ];

    const createdTeams = [];
    for (const team of teams) {
      const { data: createdTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          league_id: league.id,
          ...team
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        continue;
      }

      createdTeams.push(createdTeam);
      console.log('✅ Created team:', createdTeam.name);
    }

    // Create demo players
    const players = [
      { first_name: 'John', last_name: 'Smith', handle: 'JSmitty', position: 'C', number: 91 },
      { first_name: 'Mike', last_name: 'Johnson', handle: 'MJ23', position: 'LW', number: 23 },
      { first_name: 'David', last_name: 'Williams', handle: 'DWill', position: 'RW', number: 8 },
      { first_name: 'Chris', last_name: 'Brown', handle: 'CBrown', position: 'D', number: 4 },
      { first_name: 'Alex', last_name: 'Davis', handle: 'ADavis', position: 'D', number: 6 },
      { first_name: 'Ryan', last_name: 'Miller', handle: 'RMiller', position: 'G', number: 30 },
      { first_name: 'Tom', last_name: 'Wilson', handle: 'TWilson', position: 'C', number: 43 },
      { first_name: 'Nick', last_name: 'Anderson', handle: 'NAnderson', position: 'LW', number: 17 },
      { first_name: 'Jake', last_name: 'Thompson', handle: 'JThompson', position: 'RW', number: 19 },
      { first_name: 'Matt', last_name: 'Garcia', handle: 'MGarcia', position: 'D', number: 2 },
      { first_name: 'Dan', last_name: 'Martinez', handle: 'DMartinez', position: 'D', number: 7 },
      { first_name: 'Steve', last_name: 'Robinson', handle: 'SRobinson', position: 'G', number: 35 },
      { first_name: 'Paul', last_name: 'Clark', handle: 'PClark', position: 'C', number: 88 },
      { first_name: 'Mark', last_name: 'Lewis', handle: 'MLewis', position: 'LW', number: 12 },
      { first_name: 'Kevin', last_name: 'Lee', handle: 'KLee', position: 'RW', number: 9 },
      { first_name: 'Brian', last_name: 'Walker', handle: 'BWalker', position: 'D', number: 5 },
      { first_name: 'Jeff', last_name: 'Hall', handle: 'JHall', position: 'D', number: 3 },
      { first_name: 'Tim', last_name: 'Young', handle: 'TYoung', position: 'G', number: 31 },
      { first_name: 'Scott', last_name: 'King', handle: 'SKing', position: 'C', number: 11 },
      { first_name: 'Eric', last_name: 'Wright', handle: 'EWright', position: 'LW', number: 14 },
      { first_name: 'Adam', last_name: 'Lopez', handle: 'ALopez', position: 'RW', number: 16 },
      { first_name: 'Greg', last_name: 'Hill', handle: 'GHill', position: 'D', number: 10 },
      { first_name: 'Sam', last_name: 'Scott', handle: 'SScott', position: 'D', number: 13 },
      { first_name: 'Tony', last_name: 'Green', handle: 'TGreen', position: 'G', number: 33 }
    ];

    const createdPlayers = [];
    for (const player of players) {
      const { data: createdPlayer, error: playerError } = await supabase
        .from('players')
        .insert({
          ...player,
          is_active: true
        })
        .select()
        .single();

      if (playerError) {
        console.error('Error creating player:', playerError);
        continue;
      }

      createdPlayers.push(createdPlayer);
      console.log('✅ Created player:', `${createdPlayer.first_name} ${createdPlayer.last_name}`);
    }

    // Assign players to teams (6 players per team, 1 goalie per team)
    const teamAssignments = [
      // Thunder Hawks
      { teamIndex: 0, playerIndices: [0, 1, 2, 3, 4, 5] },
      // Ice Dragons
      { teamIndex: 1, playerIndices: [6, 7, 8, 9, 10, 11] },
      // Frost Giants
      { teamIndex: 2, playerIndices: [12, 13, 14, 15, 16, 17] },
      // Storm Wolves
      { teamIndex: 3, playerIndices: [18, 19, 20, 21, 22, 23] }
    ];

    for (const assignment of teamAssignments) {
      const team = createdTeams[assignment.teamIndex];
      
      for (const playerIndex of assignment.playerIndices) {
        const player = createdPlayers[playerIndex];
        
        // Update player with team assignment
        await supabase
          .from('players')
          .update({ team_id: team.id })
          .eq('id', player.id);

        // Create roster entry
        await supabase
          .from('rosters')
          .insert({
            season_id: season.id,
            team_id: team.id,
            player_id: player.id,
            role: playerIndex % 6 === 0 ? 'CAPTAIN' : 'PLAYER',
            start_date: '2025-09-01'
          });

        console.log(`✅ Assigned ${player.first_name} ${player.last_name} to ${team.name}`);
      }
    }

    // Create demo games
    const games = [
      {
        date: '2025-09-15T19:00:00Z',
        home_team_id: createdTeams[0].id,
        away_team_id: createdTeams[1].id,
        venue: 'Ice Palace Arena',
        status: 'COMPLETED'
      },
      {
        date: '2025-09-22T19:00:00Z',
        home_team_id: createdTeams[2].id,
        away_team_id: createdTeams[3].id,
        venue: 'Frost Dome',
        status: 'COMPLETED'
      },
      {
        date: '2025-10-06T19:00:00Z',
        home_team_id: createdTeams[0].id,
        away_team_id: createdTeams[2].id,
        venue: 'Ice Palace Arena',
        status: 'SCHEDULED'
      },
      {
        date: '2025-10-13T19:00:00Z',
        home_team_id: createdTeams[1].id,
        away_team_id: createdTeams[3].id,
        venue: 'Dragon\'s Lair',
        status: 'SCHEDULED'
      }
    ];

    for (const game of games) {
      const { data: createdGame, error: gameError } = await supabase
        .from('games')
        .insert({
          season_id: season.id,
          ...game
        })
        .select()
        .single();

      if (gameError) {
        console.error('Error creating game:', gameError);
        continue;
      }

      console.log('✅ Created game:', `${createdGame.date} - ${createdGame.home_team_id} vs ${createdGame.away_team_id}`);

      // Add some demo stats for completed games
      if (createdGame.status === 'COMPLETED') {
        // Get players from both teams
        const homeTeamPlayers = createdPlayers.filter(p => p.team_id === createdGame.home_team_id);
        const awayTeamPlayers = createdPlayers.filter(p => p.team_id === createdGame.away_team_id);

        // Add stats for home team players
        for (const player of homeTeamPlayers) {
          await supabase
            .from('game_stats')
            .insert({
              game_id: createdGame.id,
              player_id: player.id,
              team_id: createdGame.home_team_id,
              goals: Math.floor(Math.random() * 3),
              assists: Math.floor(Math.random() * 3),
              points: Math.floor(Math.random() * 5),
              shots: Math.floor(Math.random() * 8),
              time_on_ice: Math.floor(Math.random() * 1200) + 600, // 10-30 minutes
              penalty_minutes: Math.floor(Math.random() * 4),
              plus_minus: Math.floor(Math.random() * 4) - 2,
              saves: player.position === 'G' ? Math.floor(Math.random() * 30) + 20 : null,
              goals_against: player.position === 'G' ? Math.floor(Math.random() * 4) + 1 : null
            });
        }

        // Add stats for away team players
        for (const player of awayTeamPlayers) {
          await supabase
            .from('game_stats')
            .insert({
              game_id: createdGame.id,
              player_id: player.id,
              team_id: createdGame.away_team_id,
              goals: Math.floor(Math.random() * 3),
              assists: Math.floor(Math.random() * 3),
              points: Math.floor(Math.random() * 5),
              shots: Math.floor(Math.random() * 8),
              time_on_ice: Math.floor(Math.random() * 1200) + 600,
              penalty_minutes: Math.floor(Math.random() * 4),
              plus_minus: Math.floor(Math.random() * 4) - 2,
              saves: player.position === 'G' ? Math.floor(Math.random() * 30) + 20 : null,
              goals_against: player.position === 'G' ? Math.floor(Math.random() * 4) + 1 : null
            });
        }
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
      // Note: In a real scenario, you'd create the auth user first
      // For demo purposes, we'll just create the account record
      await supabase
        .from('accounts')
        .insert({
          email: user.email,
          role: user.role,
          team_id: user.team_id,
          is_active: true
        });

      console.log(`✅ Created demo ${user.role.toLowerCase()} user:`, user.email);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Data Summary:');
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

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
