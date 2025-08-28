import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { QueryProvider } from '@/components/providers/query-client-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Navigation } from '@/components/ui/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Garmin AI Chat - Intelligent Fitness Companion',
  description:
    'Transform your Garmin Connect activity data into personalized, conversational insights with AI-powered analysis.',
  keywords: [
    'Garmin',
    'fitness',
    'AI',
    'chat',
    'activity tracking',
    'workout analysis',
  ],
  authors: [{ name: 'Garmin AI Chat' }],
  openGraph: {
    title: 'Garmin AI Chat - Intelligent Fitness Companion',
    description:
      'Transform your Garmin Connect activity data into personalized, conversational insights with AI-powered analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garmin AI Chat - Intelligent Fitness Companion',
    description:
      'Transform your Garmin Connect activity data into personalized, conversational insights with AI-powered analysis.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">{children}</main>
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
