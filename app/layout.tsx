import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinFlo - Your Smart Financial Flow',
  description: 'Smart Financial Planner & Cashflow Tracker. Kelola uang, pantau dompet, dan capai tujuan finansial Anda.',
  icons: {
    icon: '/assets/logo-icon.svg',
    shortcut: '/assets/logo-icon.svg',
    apple: '/assets/logo-icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-slate-50 text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
