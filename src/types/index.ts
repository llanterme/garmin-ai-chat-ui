// Authentication types
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
  user?: User;
}

// Garmin types
export interface GarminCredentials {
  email: string;
  password: string;
}

export interface GarminCredentialsStatus {
  hasCredentials: boolean;
  lastUpdated?: string;
}

// Activity types
export interface Activity {
  id: string;
  garmin_activity_id: string;
  activity_name: string;
  activity_type: string;
  start_time: string;
  duration: number;
  distance: number;
  calories: number;
  average_speed: number;
  average_heart_rate?: number;
  average_power?: number | null;
  max_power?: number | null;
  normalized_power?: number | null;
  average_cadence?: number | null;
  max_cadence?: number | null;
  elevation_gain?: number | null;
  normalized: {
    duration_formatted: string;
    distance_km: number;
    distance_miles: number;
    average_speed_kmh: number;
    average_speed_mph: number;
    max_speed_kmh?: number | null;
    max_speed_mph?: number | null;
    average_pace_per_km?: string | null;
    average_pace_per_mile?: string | null;
    elevation_gain_ft?: number | null;
  };
}

export interface ActivityFilters {
  activityType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ActivityListResponse {
  items: Activity[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Sync types
export interface SyncRequest {
  startDate: string;
  endDate: string;
}

export interface SyncJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startDate: string;
  endDate: string;
  totalActivities?: number;
  processedActivities: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface SyncProgress {
  currentActivity: number;
  totalActivities: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  suggestedQuestions?: string[];
}

export interface IngestionStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  totalActivities: number;
  processedActivities: number;
  estimatedTimeRemaining?: number;
  lastUpdated: string;
}

// API Error types
export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// UI Component types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}