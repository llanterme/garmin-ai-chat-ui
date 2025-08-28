'use client';

import { Settings, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GarminCredentialsForm } from '@/components/auth/garmin-credentials-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { 
    user, 
    garminCredentials, 
    testGarminCredentials,
    isGarminLoading 
  } = useAuth();

  const handleTestCredentials = async () => {
    try {
      const result = await testGarminCredentials();
      alert(result?.success ? 'Garmin credentials are working!' : 'Garmin credentials test failed');
    } catch (error) {
      alert('Failed to test Garmin credentials');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your account settings and Garmin Connect integration.
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Created</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Garmin Connect Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Garmin Connect Integration
          </CardTitle>
          <CardDescription>
            Connect your Garmin account to sync activities and enable AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {garminCredentials?.hasCredentials ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Garmin Account Connected
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Last updated: {garminCredentials.lastUpdated 
                        ? new Date(garminCredentials.lastUpdated).toLocaleDateString()
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Update Credentials</h4>
                <GarminCredentialsForm isUpdate={true} />
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2">Test Connection</h4>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Test Garmin Connection
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Verify that your Garmin Connect credentials are working properly.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestCredentials}
                      disabled={isGarminLoading}
                      className="ml-4 flex-shrink-0"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Garmin Account Not Connected
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Connect your Garmin account to sync activities and enable AI analysis.
                    </p>
                  </div>
                </div>
              </div>

              <GarminCredentialsForm />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Information about how your data is handled and stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Data Storage</h4>
              <p className="text-muted-foreground">
                Your activity data is stored securely and encrypted. We only store the data 
                necessary to provide AI insights about your fitness patterns and performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Garmin Credentials</h4>
              <p className="text-muted-foreground">
                Your Garmin Connect credentials are encrypted and stored securely. 
                They are only used to sync your activity data and are never shared with third parties.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">AI Processing</h4>
              <p className="text-muted-foreground">
                When you use the AI chat feature, your activity data is processed to create embeddings 
                that enable natural language queries. This processing happens securely and your 
                personal data never leaves our secure environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}