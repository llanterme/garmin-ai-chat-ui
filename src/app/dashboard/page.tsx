import { Metadata } from 'next';
import Link from 'next/link';
import { Activity, Bot, Dumbbell, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SyncJobsList } from '@/components/sync/sync-jobs-list';
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics';

export const metadata: Metadata = {
  title: 'Dashboard - Garmin AI Chat',
  description: 'Your fitness data dashboard and AI insights overview',
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Live training metrics */}
      <DashboardMetrics />

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Dumbbell className="h-6 w-6 text-primary" />
              Workouts
            </CardTitle>
            <CardDescription>
              Generate AI-powered workout recommendations and structured training plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/workouts">
                Today&apos;s Workout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-primary" />
              Sync Activities
            </CardTitle>
            <CardDescription>
              Sync your Garmin Connect activities to keep your training data up to date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/sync">
                Sync Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              Activities
            </CardTitle>
            <CardDescription>
              Browse your synced activities with detailed metrics and performance data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/activities">
                Browse Activities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              AI Chat
            </CardTitle>
            <CardDescription>
              Ask questions about your training patterns and get intelligent insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sync Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Sync Activity</h2>
        <SyncJobsList limit={3} showCreateNew={true} />
      </div>
    </div>
  );
}
