import Link from 'next/link';
import { Activity, Bot, BarChart3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Garmin AI Chat
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transform your Garmin Connect activity data into personalized, 
          conversational insights with AI-powered analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/auth/register">
              Get Started Free
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Intelligent Fitness Analysis
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Activity Sync</CardTitle>
              <CardDescription>
                Seamlessly sync your Garmin Connect activities with date range selection and real-time progress tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>AI-Powered Chat</CardTitle>
              <CardDescription>
                Ask natural language questions about your training patterns, performance trends, and fitness insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Get personalized analysis of your workouts with advanced metrics and performance recommendations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-muted/50 rounded-lg">
        <div className="px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Connect Garmin</h3>
              <p className="text-muted-foreground">
                Securely connect your Garmin Connect account to sync your activity data.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Sync Activities</h3>
              <p className="text-muted-foreground">
                Choose your date range and watch as your activities are processed and analyzed.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Chat & Analyze</h3>
              <p className="text-muted-foreground">
                Start asking questions about your training and get intelligent insights instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to unlock your fitness insights?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of athletes who are already using AI to improve their training.
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link href="/auth/register">
            Start Your Journey
            <Zap className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
