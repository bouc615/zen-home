# ZenHome Backend API

Backend API service for ZenHome WeChat Mini Program, built with Node.js, Express, Supabase, and AI integration.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Database**: Supabase (PostgreSQL)
- **AI**: ZenMux API (xiaomi/mimo-v2-flash-free)
- **Language**: TypeScript
- **File Upload**: Supabase Storage

## Features

- ✅ Items management (CRUD)
- ✅ Recipes management (CRUD)
- ✅ AI image recognition
- ✅ AI chat assistant
- ✅ File upload to Supabase Storage
- ✅ Docker deployment support

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- ZenMux API key

### Installation

```bash
cd backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. AI credentials are already configured

### Development

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## API Endpoints

### Items

- `GET /api/items` - Get all items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Recipes

- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### AI

- `POST /api/ai/analyze-image` - Analyze image
- `POST /api/ai/chat` - Chat with AI

### Upload

- `POST /api/upload` - Upload file

## Docker Deployment

### Build and run with Docker

```bash
docker build -t zen-home-backend .
docker run -p 3000:3000 --env-file .env zen-home-backend
```

### Using Docker Compose

```bash
docker-compose up -d
```

### Stop services

```bash
docker-compose down
```

## Database Setup (Supabase)

### 1. Create Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Create Tables

Run the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  emoji TEXT,
  expiry_date DATE,
  quantity TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  usage_progress INTEGER DEFAULT 0,
  added_at BIGINT NOT NULL,
  consumed_at BIGINT,
  wasted_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  added_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_added_at ON items(added_at DESC);
CREATE INDEX idx_recipes_added_at ON recipes(added_at DESC);
```

### 3. Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `images`
3. Set it to public

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3000) |
| NODE_ENV | Environment | No (default: development) |
| SUPABASE_URL | Supabase project URL | Yes |
| SUPABASE_ANON_KEY | Supabase anon key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Yes |
| LLM_MODEL_ID | AI model ID | Yes |
| LLM_API_KEY | AI API key | Yes |
| LLM_BASE_URL | AI API base URL | Yes |
| ALLOWED_ORIGINS | CORS allowed origins | No |

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration
│   │   ├── database.ts   # Supabase config
│   │   ├── ai.ts         # AI config
│   │   └── env.ts        # Environment variables
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── types/            # TypeScript types
│   └── app.ts            # App entry point
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
