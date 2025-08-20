# EHockey League Site - API Documentation

This document provides comprehensive API documentation for the EHockey League site, including all endpoints, request/response formats, authentication, and examples.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
6. [Data Models](#data-models)
7. [Rate Limiting](#rate-limiting)

## Overview

The EHockey League API is a RESTful API built with Next.js 15 and Supabase. It provides endpoints for managing leagues, teams, players, games, and statistics with role-based access control.

### Features

- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Role-Based Access Control**: Different permissions for Players, Managers, and Admins
- **Pagination**: Support for large datasets
- **Filtering**: Query parameters for data filtering
- **Validation**: Input validation using Zod schemas
- **Error Handling**: Consistent error responses

## Authentication

The API uses Supabase authentication with JWT tokens. All requests must include a valid authentication token.

### Authentication Header

```http
Authorization: Bearer <jwt_token>
```

### Getting a Token

1. **Sign up/Sign in** via Supabase Auth
2. **Get session token** from the client
3. **Include token** in API requests

### Role-Based Permissions

| Role | Permissions |
|------|-------------|
| **PLAYER** | View league, team, stats, edit profile |
| **MANAGER** | All player permissions + manage team, create games, enter stats, import/export |
| **ADMIN** | All manager permissions + manage league, manage users, configure branding |

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Error Handling

All API endpoints return consistent error responses:

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)",
  "status": 400
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Endpoints

### Leagues

#### GET /api/leagues

Get all leagues with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `search` (string, optional) - Search by league name
- `status` (string, optional) - Filter by status (ACTIVE, INACTIVE, ARCHIVED)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "EHockey League",
      "description": "Premier hockey league",
      "logo_url": "https://example.com/logo.png",
      "status": "ACTIVE",
      "owner_id": "user-uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/leagues

Create a new league (Admin only).

**Request Body:**
```json
{
  "name": "New League",
  "description": "League description",
  "logo_url": "https://example.com/logo.png",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "New League",
    "description": "League description",
    "logo_url": "https://example.com/logo.png",
    "status": "ACTIVE",
    "owner_id": "user-uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/leagues/{id}

Get a specific league by ID.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "EHockey League",
    "description": "Premier hockey league",
    "logo_url": "https://example.com/logo.png",
    "status": "ACTIVE",
    "owner_id": "user-uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "teams": [
      {
        "id": "team-uuid",
        "name": "Team Name",
        "abbreviation": "TN"
      }
    ]
  }
}
```

#### PUT /api/leagues/{id}

Update a league (Admin only).

**Request Body:**
```json
{
  "name": "Updated League Name",
  "description": "Updated description"
}
```

#### DELETE /api/leagues/{id}

Delete a league (Admin only).

### Teams

#### GET /api/teams

Get all teams with optional filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional)
- `league_id` (string, optional) - Filter by league
- `status` (string, optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Team Name",
      "abbreviation": "TN",
      "league_id": "league-uuid",
      "colors": {
        "primary": "#1e40af",
        "secondary": "#3b82f6"
      },
      "logo_url": "https://example.com/logo.png",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/teams

Create a new team (Manager/Admin only).

**Request Body:**
```json
{
  "name": "New Team",
  "abbreviation": "NT",
  "league_id": "league-uuid",
  "primary_color": "#1e40af",
  "secondary_color": "#3b82f6",
  "logo_url": "https://example.com/logo.png"
}
```

#### GET /api/teams/{id}

Get a specific team with players and stats.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Team Name",
    "abbreviation": "TN",
    "league_id": "league-uuid",
    "colors": {
      "primary": "#1e40af",
      "secondary": "#3b82f6"
    },
    "logo_url": "https://example.com/logo.png",
    "players": [
      {
        "id": "player-uuid",
        "first_name": "John",
        "last_name": "Doe",
        "handle": "johndoe",
        "position": "C",
        "number": 91
      }
    ],
    "stats": {
      "games_played": 10,
      "wins": 7,
      "losses": 3,
      "points": 14
    }
  }
}
```

#### PUT /api/teams/{id}

Update a team (Manager/Admin only).

#### DELETE /api/teams/{id}

Delete a team (Manager/Admin only).

### Players

#### GET /api/players

Get all players with optional filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional)
- `team_id` (string, optional) - Filter by team
- `position` (string, optional) - Filter by position
- `is_active` (boolean, optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "handle": "johndoe",
      "position": "C",
      "number": 91,
      "team_id": "team-uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/players

Create a new player (Manager/Admin only).

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "handle": "johndoe",
  "position": "C",
  "number": 91,
  "team_id": "team-uuid",
  "is_active": true
}
```

#### GET /api/players/{id}

Get a specific player with stats.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "handle": "johndoe",
    "position": "C",
    "number": 91,
    "team_id": "team-uuid",
    "is_active": true,
    "team": {
      "id": "team-uuid",
      "name": "Team Name",
      "abbreviation": "TN"
    },
    "stats": {
      "games_played": 10,
      "goals": 15,
      "assists": 20,
      "points": 35,
      "shots": 45,
      "penalty_minutes": 10,
      "plus_minus": 8
    }
  }
}
```

#### PUT /api/players/{id}

Update a player (Manager/Admin only).

#### DELETE /api/players/{id}

Delete a player (Manager/Admin only).

### Games

#### GET /api/games

Get all games with optional filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `season_id` (string, optional) - Filter by season
- `team_id` (string, optional) - Filter by team
- `status` (string, optional) - Filter by status
- `date_from` (string, optional) - Filter by start date
- `date_to` (string, optional) - Filter by end date

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "season_id": "season-uuid",
      "date": "2024-01-15T19:00:00Z",
      "home_team_id": "team-uuid",
      "away_team_id": "team-uuid-2",
      "venue": "Arena Name",
      "status": "COMPLETED",
      "notes": "Game notes",
      "home_team": {
        "id": "team-uuid",
        "name": "Home Team",
        "abbreviation": "HT"
      },
      "away_team": {
        "id": "team-uuid-2",
        "name": "Away Team",
        "abbreviation": "AT"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/games

Create a new game (Manager/Admin only).

**Request Body:**
```json
{
  "season_id": "season-uuid",
  "date": "2024-01-15T19:00:00Z",
  "home_team_id": "team-uuid",
  "away_team_id": "team-uuid-2",
  "venue": "Arena Name",
  "status": "SCHEDULED",
  "notes": "Game notes"
}
```

#### GET /api/games/{id}

Get a specific game with stats.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "season_id": "season-uuid",
    "date": "2024-01-15T19:00:00Z",
    "home_team_id": "team-uuid",
    "away_team_id": "team-uuid-2",
    "venue": "Arena Name",
    "status": "COMPLETED",
    "notes": "Game notes",
    "home_team": {
      "id": "team-uuid",
      "name": "Home Team",
      "abbreviation": "HT"
    },
    "away_team": {
      "id": "team-uuid-2",
      "name": "Away Team",
      "abbreviation": "AT"
    },
    "stats": [
      {
        "player_id": "player-uuid",
        "team_id": "team-uuid",
        "goals": 2,
        "assists": 1,
        "points": 3,
        "shots": 5,
        "time_on_ice": 1200,
        "penalty_minutes": 0,
        "plus_minus": 1
      }
    ],
    "score": {
      "home": 3,
      "away": 2
    }
  }
}
```

#### PUT /api/games/{id}

Update a game (Manager/Admin only).

#### DELETE /api/games/{id}

Delete a game (Manager/Admin only).

### Game Statistics

#### GET /api/stats

Get game statistics with optional filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `game_id` (string, optional) - Filter by game
- `player_id` (string, optional) - Filter by player
- `team_id` (string, optional) - Filter by team
- `season_id` (string, optional) - Filter by season

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "game_id": "game-uuid",
      "player_id": "player-uuid",
      "team_id": "team-uuid",
      "goals": 2,
      "assists": 1,
      "points": 3,
      "shots": 5,
      "time_on_ice": 1200,
      "penalty_minutes": 0,
      "plus_minus": 1,
      "saves": null,
      "goals_against": null,
      "player": {
        "id": "player-uuid",
        "first_name": "John",
        "last_name": "Doe",
        "handle": "johndoe"
      },
      "team": {
        "id": "team-uuid",
        "name": "Team Name",
        "abbreviation": "TN"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/stats

Create new game statistics (Manager/Admin only).

**Request Body:**
```json
{
  "game_id": "game-uuid",
  "player_id": "player-uuid",
  "team_id": "team-uuid",
  "goals": 2,
  "assists": 1,
  "points": 3,
  "shots": 5,
  "time_on_ice": 1200,
  "penalty_minutes": 0,
  "plus_minus": 1,
  "saves": null,
  "goals_against": null
}
```

#### GET /api/stats/{id}

Get specific game statistics.

#### PUT /api/stats/{id}

Update game statistics (Manager/Admin only).

#### DELETE /api/stats/{id}

Delete game statistics (Manager/Admin only).

### Standings

#### GET /api/standings

Get team standings for a season.

**Query Parameters:**
- `season_id` (string, required) - Season ID
- `league_id` (string, optional) - League ID for filtering

**Response:**
```json
{
  "data": {
    "season_id": "season-uuid",
    "standings": [
      {
        "team_id": "team-uuid",
        "team_name": "Team Name",
        "team_abbreviation": "TN",
        "games_played": 10,
        "wins": 7,
        "losses": 2,
        "overtime_losses": 1,
        "points": 15,
        "goals_for": 35,
        "goals_against": 25,
        "goal_differential": 10,
        "regulation_wins": 6,
        "head_to_head_wins": 2
      }
    ],
    "rules": {
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
  }
}
```

### Health Check

#### GET /api/health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

## Data Models

### League

```typescript
interface League {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  owner_id: string;
  created_at: string;
  updated_at: string;
}
```

### Team

```typescript
interface Team {
  id: string;
  name: string;
  abbreviation: string;
  league_id: string;
  colors: {
    primary: string;
    secondary: string;
  };
  logo_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Player

```typescript
interface Player {
  id: string;
  first_name: string;
  last_name: string;
  handle: string;
  position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  number?: number;
  team_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Game

```typescript
interface Game {
  id: string;
  season_id: string;
  date: string;
  home_team_id: string;
  away_team_id: string;
  venue?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### GameStats

```typescript
interface GameStats {
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
  saves?: number;
  goals_against?: number;
  created_at: string;
  updated_at: string;
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers
- **Exceeded Limit**: Returns 429 Too Many Requests

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Examples

### Complete API Workflow

1. **Create a League**
```bash
curl -X POST http://localhost:3000/api/leagues \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "EHockey League",
    "description": "Premier hockey league",
    "status": "ACTIVE"
  }'
```

2. **Create a Team**
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thunder",
    "abbreviation": "THD",
    "league_id": "league-uuid",
    "primary_color": "#1e40af",
    "secondary_color": "#3b82f6"
  }'
```

3. **Add a Player**
```bash
curl -X POST http://localhost:3000/api/players \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "handle": "johndoe",
    "position": "C",
    "number": 91,
    "team_id": "team-uuid"
  }'
```

4. **Schedule a Game**
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "season_id": "season-uuid",
    "date": "2024-01-15T19:00:00Z",
    "home_team_id": "team-uuid",
    "away_team_id": "team-uuid-2",
    "venue": "Arena",
    "status": "SCHEDULED"
  }'
```

5. **Enter Game Stats**
```bash
curl -X POST http://localhost:3000/api/stats \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "game-uuid",
    "player_id": "player-uuid",
    "team_id": "team-uuid",
    "goals": 2,
    "assists": 1,
    "points": 3,
    "shots": 5,
    "time_on_ice": 1200,
    "penalty_minutes": 0,
    "plus_minus": 1
  }'
```

6. **Get Standings**
```bash
curl -X GET "http://localhost:3000/api/standings?season_id=season-uuid" \
  -H "Authorization: Bearer <token>"
```

## SDK and Client Libraries

### JavaScript/TypeScript

```typescript
class EHockeyAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getLeagues(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/leagues?${queryString}`);
  }

  async createLeague(data: any) {
    return this.request('/leagues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add more methods for other endpoints...
}
```

## Support

For API support:

1. Check the error responses for specific error messages
2. Verify authentication and permissions
3. Review request/response formats
4. Check rate limiting headers
5. Contact support with specific error details

For additional information, refer to the main README.md file or create an issue in the repository.
