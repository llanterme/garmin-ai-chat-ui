import { Metadata } from 'next';
import Link from 'next/link';
import { Activity, Bot, RefreshCw, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SyncJobsList } from '@/components/sync/sync-jobs-list';

export const metadata: Metadata = {
  title: 'Dashboard - Garmin AI Chat',
  description: 'Your fitness data dashboard and AI insights overview',
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to Garmin AI Chat
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your intelligent fitness companion is ready to analyze your training data
          and provide personalized insights through natural language conversations.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-primary" />
              Sync Activities
            </CardTitle>
            <CardDescription>
              Connect and sync your Garmin Connect activities to start analyzing your fitness data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/sync">
                Start Sync
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              View Activities
            </CardTitle>
            <CardDescription>
              Browse and explore your synced activities with detailed metrics and insights.
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
              Ask questions about your training patterns and get intelligent insights from your data.
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

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to unlock the full potential of your fitness data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold">Connect Garmin</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Securely connect your Garmin Connect account with your credentials.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/settings">
                  <Settings className="mr-2 h-3 w-3" />
                  Settings
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Sync Your Data</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose your date range and sync activities from Garmin Connect.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/sync">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Sync Now
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold">Start Chatting</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask questions about your training and get AI-powered insights.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/chat">
                  <Bot className="mr-2 h-3 w-3" />
                  AI Chat
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sync Activity */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Recent Sync Activity</h2>
        <SyncJobsList limit={3} showCreateNew={true} />
      </div>
    </div>
  );
}