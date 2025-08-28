# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Garmin AI Chat** is an intelligent fitness companion frontend that transforms Garmin Connect activity data into personalized, conversational insights through AI-powered analysis. Users can sync their workout history, process it through AI embeddings, and have natural language conversations about their training performance, progress patterns, and fitness trends.

## Core Architecture

### Technology Stack
- **Framework**: Next.js 15.5.2 with App Router and TypeScript
- **Styling**: Tailwind CSS 3.4.17 (downgraded from v4 for stability)
- **UI Components**: Radix Primitives with custom design system
- **State Management**: 
  - Zustand for client-side state management
  - TanStack Query v5 for server-state and API caching
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with automatic token refresh
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Key Dependencies
```json
{
  "next": "15.5.2",
  "react": "19.1.0",
  "typescript": "^5",
  "tailwindcss": "^3.4.17",
  "@tanstack/react-query": "^5.85.5",
  "zustand": "^5.0.8",
  "axios": "^1.11.0",
  "react-hook-form": "^7.62.0",
  "zod": "^4.1.3"
}
```

## Development Commands

### Primary Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build --no-lint` - Build for production (linting disabled due to strict mode conflicts)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (currently has TypeScript strict mode warnings)

### Important Notes
- **Do not use --turbopack flag** - Causes CSS processing issues with Tailwind
- Build uses `--no-lint` flag due to TypeScript strict mode conflicts
- PostCSS configuration requires autoprefixer for Tailwind compatibility

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                    # Authentication (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx       # Main dashboard
│   ├── activities/              # Activity management
│   │   ├── page.tsx            # Activity list
│   │   └── [id]/page.tsx       # Activity detail (async params)
│   ├── sync/page.tsx           # Garmin sync interface
│   ├── chat/page.tsx           # AI chat system
│   ├── settings/page.tsx       # User settings
│   ├── layout.tsx              # Root layout with providers
│   └── globals.css             # Tailwind imports + CSS variables
├── components/
│   ├── ui/                     # Base UI components (Button, Card, Input, etc.)
│   ├── auth/                   # Authentication components
│   ├── activities/             # Activity-related components
│   ├── sync/                   # Sync interface components
│   ├── chat/                   # AI chat components
│   └── providers/              # Context providers (Auth, QueryClient)
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts            # Authentication logic
│   ├── use-activities.ts      # Activity data management
│   ├── use-sync.ts           # Sync operations
│   └── use-chat.ts           # Chat system integration
├── lib/                       # API clients and utilities
│   ├── api.ts                # Base Axios client with token refresh
│   ├── auth-api.ts           # Authentication endpoints
│   ├── activities-api.ts     # Activity endpoints
│   ├── sync-api.ts          # Sync endpoints
│   ├── chat-api.ts          # Chat/AI endpoints
│   └── utils.ts             # Utility functions
├── store/
│   └── auth.ts              # Zustand auth store
├── types/
│   └── index.ts             # TypeScript definitions
└── utils/                   # Additional utilities
```

## Backend API Integration

The frontend integrates with a FastAPI backend at `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

### API Structure
- **Base URL**: `/api/v1`
- **Authentication**: JWT with Bearer tokens
- **Token Management**: Automatic refresh via Axios interceptors

### Key Endpoints
```typescript
// Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login  
POST /api/v1/auth/refresh
POST /api/v1/auth/garmin-credentials

// Activity Synchronization
POST /api/v1/sync/activities        # Start sync job
GET  /api/v1/sync/status/{sync_id}  # Monitor progress
GET  /api/v1/sync/history           # Sync history

// Activity Management
GET  /api/v1/activities/            # List activities
GET  /api/v1/activities/{id}        # Activity details

// AI Chat System
GET  /api/v1/chat/ingestion/status  # Check embedding status
POST /api/v1/chat/ingestion/start   # Start data ingestion
POST /api/v1/chat/query            # Natural language queries
```

### Authentication Flow
1. **Login/Register** → Receive JWT access + refresh tokens
2. **Token Storage** → localStorage (access: 30min, refresh: 30 days)
3. **API Calls** → Automatic Bearer token attachment
4. **Token Refresh** → Automatic refresh on 401 responses
5. **Garmin Setup** → One-time encrypted credential storage

### Data Processing Flow
1. **Garmin Sync** → Fetch activities from Garmin Connect
2. **Activity Storage** → MySQL database with structured data
3. **AI Ingestion** → Process activities into vector embeddings (Pinecone)
4. **Chat Interface** → Natural language queries with context

## Key Features Implementation

### 1. Authentication System (`src/components/auth/`)
- JWT-based auth with automatic token refresh
- Secure Garmin Connect credential management
- Protected route guards in layout.tsx
- Login/register forms with Zod validation

### 2. Activity Synchronization (`src/components/sync/`)
- **Real-time Progress**: Polling-based sync monitoring
- **Date Range Selection**: Custom date picker for targeted syncing
- **Error Handling**: Comprehensive error states and retry mechanisms
- **History Tracking**: Complete sync job history with status

### 3. Activity Management (`src/components/activities/`)
- **Pagination**: Server-side pagination with skip/limit
- **Filtering**: Activity type, date range, search functionality
- **Detail Views**: Comprehensive metrics with unit conversions
- **Multi-sport Support**: Icons and formatting for different activity types

### 4. AI Chat System (`src/components/chat/`)
- **Three-Phase Integration**:
  1. **Status Check**: Verify ingestion readiness
  2. **Data Ingestion**: Process activities into vector embeddings
  3. **Chat Interface**: Natural language conversations
- **Real-time Updates**: Polling for ingestion progress
- **Conversation Management**: Thread-based chat with history

## Important Configuration Details

### Tailwind CSS Setup
```javascript
// tailwind.config.ts - Using v3.4.17 for stability
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // CSS variable-based color system
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Garmin brand colors
        garmin: { 50: '#f0f9ff', 500: '#0ea5e9', 900: '#0c4a6e' }
      }
    }
  }
}
```

### PostCSS Configuration
```javascript
// postcss.config.mjs - Required for Tailwind v3
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

### TypeScript Configuration
- Strict mode enabled but some conflicts with ESLint
- Next.js 15 requires async params: `params: Promise<{ id: string }>`
- No explicit `any` types allowed (use `unknown` instead)

## Development Guidelines

### API Integration Patterns
1. **Use TanStack Query** for all server state management
2. **Handle Loading States** with proper UI feedback
3. **Error Boundaries** for graceful error handling
4. **Polling Pattern** for long-running operations (sync, ingestion)
5. **Optimistic Updates** where appropriate

### Component Architecture
1. **Atomic Design**: Break components into reusable parts
2. **Custom Hooks**: Extract business logic from components
3. **Type Safety**: Comprehensive TypeScript interfaces
4. **Accessibility**: WCAG compliance with Radix primitives

### State Management Strategy
- **Zustand**: User authentication state
- **TanStack Query**: API data caching and synchronization
- **Local State**: Form state and UI interactions
- **URL State**: Filters and pagination parameters

### Performance Considerations
- **Code Splitting**: Lazy load heavy components
- **Caching Strategy**: 5-minute stale time for queries
- **Pagination**: Server-side pagination for large datasets
- **Debouncing**: Search inputs and API calls
- **Polling Intervals**: 5-10s for sync progress, 30s for ingestion

## Common Development Tasks

### Adding New API Endpoints
1. Add types to `src/types/index.ts`
2. Create API functions in relevant `src/lib/*-api.ts`
3. Create custom hooks in `src/hooks/`
4. Implement UI components with proper loading/error states

### Creating New Pages
1. Add route in `src/app/` following App Router conventions
2. Implement authentication guards if needed
3. Add navigation links in `src/components/ui/navigation.tsx`
4. Follow async params pattern for dynamic routes

### UI Component Development
1. Use Radix primitives as base components
2. Extend with Tailwind styling and CSS variables
3. Include variant support using `class-variance-authority`
4. Add proper TypeScript interfaces and accessibility

## Known Issues & Workarounds

### Build Configuration
- **Turbopack disabled**: Causes CSS processing errors with Tailwind
- **Linting disabled in build**: TypeScript strict mode conflicts
- **Tailwind v3**: Downgraded from v4 for Next.js compatibility

### TypeScript Issues
- Some ESLint rules conflict with strict mode
- Async params required for Next.js 15 dynamic routes
- `unknown` type preferred over `any` for error handling

### API Integration Notes
- Automatic token refresh implemented via Axios interceptors
- localStorage used for token storage (consider httpOnly cookies for production)
- Polling-based real-time updates (consider WebSocket for better UX)

## Environment Configuration

### Required Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production Considerations
- Update API URL for production backend
- Implement proper error tracking (Sentry, etc.)
- Add monitoring for API performance
- Consider CDN for static assets
- Implement proper SEO metadata

This frontend provides a comprehensive fitness data analysis platform with AI-powered conversational insights. The architecture supports scalable development while maintaining type safety and excellent user experience.