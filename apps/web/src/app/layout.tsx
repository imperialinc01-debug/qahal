import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Qahal — Church Management',
  description: 'Modern church management platform for growing congregations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
