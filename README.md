# EHockey League Site

A comprehensive hockey league management system built with Next.js, Supabase, and TypeScript. Features role-based access control, real-time statistics, and team management capabilities.

## 🏒 Features

- **Role-Based Access Control**: Player, Manager, and Admin panels
- **League Management**: Create and manage multiple leagues and seasons
- **Team Management**: Roster management, player assignments, and team statistics
- **Game Tracking**: Schedule games, record statistics, and compute standings
- **Real-Time Stats**: Player and team performance tracking
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Branding Support**: Customizable logos and color schemes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd eashl-site-master
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Branding Configuration (optional)
NEXT_PUBLIC_BRAND_LOGO_URL=/logo.png
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#1e40af
NEXT_PUBLIC_BRAND_SECONDARY_COLOR=#3b82f6
```

### 3. Database Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and keys

2. **Run Database Migrations**:
   ```bash
   # The database schema is defined in src/lib/supabase/types.ts
   # Supabase will automatically create tables based on the types
   ```

3. **Seed Demo Data**:
   ```bash
   npm run seed
   ```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 👥 Role-Based Access Control

The application supports three user roles with different permissions:

### Player Role
- View personal statistics and team information
- Access to Player Panel
- Read-only access to league data

### Manager Role
- All Player permissions
- Team roster management
- Game scheduling and statistics entry
- Access to Manager Panel

### Admin Role
- All Manager permissions
- League and season management
- User role management
- System configuration and branding
- Access to Admin Panel

## 🗄️ Database Schema

### Core Tables

- **accounts**: User accounts with roles and permissions
- **leagues**: Hockey leagues with metadata
- **seasons**: League seasons with rules and schedules
- **teams**: Teams within leagues
- **players**: Individual player profiles
- **rosters**: Player-team-season relationships
- **games**: Scheduled and completed games
- **game_stats**: Individual player statistics per game

### Demo Data

The seed script creates:
- 1 demo league (EHockey Premier League)
- 1 active season (S2025-Fall)
- 4 teams with 24 players
- 4 games (2 completed, 2 scheduled)
- 3 demo users (player, manager, admin)

## 🔑 Demo Credentials

After running the seed script, you can test with these demo accounts:

- **Player**: `player@ehockey.net` (PLAYER role)
- **Manager**: `manager@ehockey.net` (MANAGER role)
- **Admin**: `admin@ehockey.net` (ADMIN role)

*Note: These are demo accounts for testing. In production, you'll need to create real user accounts.*

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth-pages)/      # Authentication pages
│   ├── (protected-pages)/ # Role-based panels
│   │   ├── player/        # Player Panel
│   │   ├── manager/       # Manager Panel
│   │   └── admin/         # Admin Panel
│   └── api/               # API routes
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                  # Utilities and configuration
│   ├── supabase/         # Supabase client and types
│   ├── stores/           # Zustand state management
│   └── middleware/       # Role-based guards
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with demo data
```

### Adding New Features

1. **New API Routes**: Add to `src/app/api/`
2. **New Components**: Add to `src/components/`
3. **New Types**: Add to `src/types/`
4. **Database Changes**: Update `src/lib/supabase/types.ts`

### Role-Based Development

When adding new features, consider role permissions:

```typescript
import { hasPermission } from '@/types/auth';

// Check permissions before rendering
if (hasPermission(userRole, 'canManageTeam')) {
  // Show manager-only features
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### Environment Variables for Production

Ensure these are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (your domain)

## 🔧 Configuration

### Branding

Customize the application branding through environment variables:

```bash
NEXT_PUBLIC_BRAND_LOGO_URL=/your-logo.png
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#your-primary-color
NEXT_PUBLIC_BRAND_SECONDARY_COLOR=#your-secondary-color
```

### League Rules

League rules and tiebreakers can be configured per season in the database:

```json
{
  "points": {
    "win": 2,
    "otLoss": 1,
    "loss": 0
  },
  "tiebreakers": [
    "points",
    "regulationWins", 
    "goalDifferential",
    "headToHead",
    "goalsFor"
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [SEEDING.md](./SEEDING.md) for database setup
- Review the codebase structure
- Create an issue for bugs or feature requests

## 🎯 Roadmap

- [ ] EA Sports API integration
- [ ] Advanced statistics and analytics
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Tournament brackets
- [ ] Player trading system
