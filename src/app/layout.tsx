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
  title: 'Athlete IQ - Training Intelligence',
  description:
    'AI-powered endurance training intelligence. Sync your Garmin data, compute training metrics, and get personalized workout recommendations.',
  keywords: [
    'Garmin',
    'endurance training',
    'AI coaching',
    'training load',
    'workout recommendations',
    'FTP',
    'pace zones',
  ],
  authors: [{ name: 'Athlete IQ' }],
  openGraph: {
    title: 'Athlete IQ - Training Intelligence',
    description:
      'AI-powered endurance training intelligence. Sync your Garmin data, compute training metrics, and get personalized workout recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Athlete IQ - Training Intelligence',
    description:
      'AI-powered endurance training intelligence. Sync your Garmin data, compute training metrics, and get personalized workout recommendations.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var t = localStorage.getItem('athlete-iq-theme');
              var h = document.documentElement;
              if (t === 'light') {
                h.classList.remove('dark');
                h.classList.add('light');
              } else {
                h.classList.remove('light');
                h.classList.add('dark');
              }
            } catch(e) {}
          `
        }} />
      </head>
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
