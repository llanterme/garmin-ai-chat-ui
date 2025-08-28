# Garmin AI Chat - Frontend

A comprehensive Next.js frontend for the Garmin AI Chat application, providing intelligent fitness insights through natural language conversations with your Garmin Connect activity data.

## Features

### 🔐 Authentication & Security
- JWT-based authentication with automatic token refresh
- Secure Garmin Connect credential storage
- Protected routes and auth guards
- Account management and settings

### 🔄 Activity Synchronization
- Real-time sync from Garmin Connect
- Date range selection for targeted syncing
- Progress monitoring with live updates
- Sync history and error handling
- Support for multiple activity types

### 📊 Activity Management
- Comprehensive activity browsing with pagination
- Advanced filtering (date, type, location)
- Search functionality across activities
- Detailed activity views with metrics
- Unit conversions (pace, speed, distance)
- Multi-sport support (running, cycling, swimming, etc.)

### 🤖 AI-Powered Chat System
- Three-phase integration:
  1. Ingestion status checking
  2. Activity data processing into vector embeddings
  3. Natural language chat interface
- Real-time conversation interface
- Suggested questions to get started
- Copy functionality for AI responses
- Conversation history and management

### 🎨 Modern UI/UX
- Responsive design for mobile and desktop
- Dark/light theme support
- Smooth animations and transitions
- Loading states and skeleton screens
- Accessibility-compliant components
- Professional fitness-focused design

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS 4.x with custom design system
- **UI Components**: Radix Primitives + custom components
- **State Management**: Zustand (client) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Running instance of the Garmin AI Chat backend API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd garmin-ai-chat-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checking

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── activities/        # Activity management
│   ├── sync/              # Sync interface
│   ├── chat/              # AI chat system
│   └── settings/          # User settings
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── auth/              # Authentication components
│   ├── activities/        # Activity-related components
│   ├── sync/              # Sync-related components
│   ├── chat/              # Chat system components
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API clients
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## Key Features

### Authentication System
- **JWT Management**: Automatic token refresh and secure storage
- **Garmin Integration**: Secure credential management for Garmin Connect
- **Protected Routes**: Route guards based on authentication status

### Activity Sync System
- **Real-time Progress**: Live sync monitoring with progress bars
- **Error Handling**: Comprehensive error states and retry mechanisms
- **History Tracking**: Complete sync job history with filtering

### AI Chat Integration
- **Three-Phase Flow**: Status check → Data ingestion → Chat interface
- **Vector Processing**: Activity data embedding for AI analysis
- **Natural Language**: Conversational interface for fitness insights

### Activity Management
- **Rich Filtering**: Multiple filter options with type-ahead search
- **Performance Metrics**: Comprehensive activity analytics
- **Responsive Design**: Optimized for all screen sizes

## API Integration

The frontend integrates with a FastAPI backend providing:

- `/api/v1/auth/*` - Authentication and user management
- `/api/v1/sync/*` - Activity synchronization
- `/api/v1/activities/*` - Activity data management
- `/api/v1/chat/*` - AI chat and embeddings

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- No `any` types allowed
- Comprehensive error handling

### Component Structure
- Atomic design principles
- Reusable UI components with variants
- Custom hooks for business logic
- Proper loading and error states

### Performance
- Code splitting and lazy loading
- Image optimization
- Efficient re-rendering with React memoization
- Bundle size optimization

### Accessibility
- WCAG 2.2 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
