// Authentication types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  last_garmin_sync?: string;
  has_garmin_credentials?: boolean;
  createdAt?: string; // Keep for backwards compatibility
  updatedAt?: string; // Keep for backwards compatibility
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
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
  normalized?: {
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

export interface ActivitiesSummary {
  total_activities: number;
  total_distance_km: number;
  total_duration_hours: number;
  total_calories: number;
}

// Sync types - Updated for unified sync + ingestion flow
export interface SyncRequest {
  days?: number; // Number of days to sync (1-365)
  start_date?: string; // Alternative: specific start date
  end_date?: string; // Alternative: specific end date
  sync_type?: string; // Type of data to sync (default: "activities")
  force_resync?: boolean; // Force re-sync even if already synced
  force_reingest?: boolean; // NEW: Forces re-ingestion to Pinecone
  batch_size?: number; // NEW: Batch size for Pinecone ingestion (1-50)
}

export interface SyncResponse {
  task_id: string;
  message: string;
  status_url: string;
}

// New unified task system
export interface TaskStatus {
  task_id: string;
  task_type: string;
  task_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress_percentage: number; // 0-100
  progress_message: string;
  result_data?: TaskResultData;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
}

export interface TaskResultData {
  status: string;
  sync_id: string;
  activities_in_date_range: number;
  activities_synced: number;
  activities_already_in_db: number;
  activities_failed: number;
  ingested_count: number;
  vectorized_activities: number;
}

export interface TaskListResponse {
  tasks: TaskStatus[];
  total: number;
  page: number;
  page_size: number;
}

// Legacy types - keeping for backward compatibility during transition
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
  response: string;
  conversation_id: string;
  follow_up_questions?: string[];
  relevant_activities?: any[];
  timestamp?: string;
  activity_count?: number;
  error?: string | null;
}

export interface IngestionStatus {
  database_activities: number;
  vectorized_activities: number;
  sync_needed: boolean;
  sync_percentage: number;
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

// Workout types
export interface WorkoutRecommendation {
  recommendationType: string;
  durationMinutes: number;
  intensityDescription: string;
  reasoningSummary: string;
  riskLevel: string;
  confidence: number;
}

export interface WorkoutInterval {
  description: string;
  durationMinutes: number;
  target: string;
}

export interface WorkoutSegment {
  segment: string;
  durationMinutes: number;
  target: string;
  intervals: WorkoutInterval[];
}

export interface WorkoutPlan {
  sport: string;
  recommendationType: string;
  durationMinutes: number;
  intensityDescription: string;
  workoutStructure: WorkoutSegment[];
  confidence: number;
  performanceMetrics?: Record<string, unknown>;
}

export interface ZoneDistribution {
  lowIntensityPercent: number;
  moderatePercent: number;
  highPercent: number;
}

export interface RunningMetrics {
  thresholdPace?: string;
  tempoPace?: string;
  aerobicPace?: string;
  easyPace?: string;
  vo2maxPace?: string;
}

export interface CyclingMetrics {
  ftpWatts?: number;
  thresholdWatts?: number;
  tempoWatts?: number;
  aerobicWatts?: number;
  easyWatts?: number;
  vo2maxWatts?: number;
}

export interface PerformanceMetrics {
  running?: RunningMetrics;
  cycling?: CyclingMetrics;
  runningSource?: string;
  cyclingSource?: string;
}

export interface TrainingMetrics {
  totalLoad7Days: number;
  totalLoad28Days: number;
  acuteChronicRatio: number;
  hardSessions7Days: number;
  daysSinceHardSession: number;
  daysSinceRestDay: number | null;
  daysSinceRecoveryDay: number | null;
  avgAerobicEffect7Days: number;
  zoneDistribution7Days: ZoneDistribution;
  sportDistribution7Days: Record<string, number> | null;
  performanceMetrics: PerformanceMetrics;
}

export interface RecommendationRequest {
  daysBack?: number;
  timezone?: string;
}

export interface WorkoutPlanRequest {
  daysBack?: number;
  timezone?: string;
  sportOverride?: string;
  durationOverride?: number;
  recommendationTypeOverride?: string;
}

// Weekly Plan types
export interface DailyPlan {
  date: string;
  dayNumber: number;
  sport: string;
  recommendationType: string;
  durationMinutes: number;
  intensityDescription: string;
  workoutStructure: WorkoutSegment[];
  confidence: number;
  rationale: string;
}

export interface WeeklyPlan {
  weekStart: string;
  weekEnd: string;
  days: DailyPlan[];
  performanceMetrics?: Record<string, unknown>;
}

export interface WeeklyPlanRequest {
  daysBack?: number;
  timezone?: string;
}

// Trends types
export interface TrendDataPoint {
  weekEnd: string;
  weekStart: string;
  totalLoad: number;
  acr: number;
  ftpWatts: number | null;
  thresholdPace: string | null;
  activityCount: number;
}

export interface TrendData {
  startDate: string;
  endDate: string;
  days: number;
  dataPoints: TrendDataPoint[];
}

// Insights types
export interface PostSyncInsight {
  insight: string;
  type: 'improvement' | 'concern' | 'pattern' | 'milestone' | 'tip';
  generated_at: string;
  cached: boolean;
}

export interface TrainingMilestone {
  type: 'improvement' | 'consistency' | 'volume' | 'personal_best';
  title: string;
  description: string;
  value: string | null;
}

export interface MilestonesResponse {
  milestones: TrainingMilestone[];
  generated_at: string;
  cached: boolean;
}

export interface ConversationSummary {
  conversation_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message: string | null;
  last_message_role: string | null;
  title?: string | null;
}

export interface ConversationHistoryResponse {
  conversations: ConversationSummary[];
  total: number;
  page: number;
  size: number;
}

export interface ConversationDetail {
  conversation_id: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string | null;
  }>;
  message_count: number;
}

export interface ActivityAnalysis {
  analysis: string;
  trainingStimulus: string;   // camelCase to match Java response (was training_stimulus)
  effortLevel: string;        // camelCase to match Java response (was effort_level)
  activity_id: string;        // Python sets this, stays snake_case
  cached: boolean;            // Python sets this, stays snake_case
  error?: string | null;      // Optional error field
}