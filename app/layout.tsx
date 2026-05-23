import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiMo GitHub Repo Doctor - AI-Powered Repository Analysis',
  description: 'Optimize your GitHub repositories for grant submissions and hackathons with AI-powered analysis',
  keywords: ['github', 'repository', 'analysis', 'ai', 'grant', 'hackathon', 'mimo'],
  authors: [{ name: 'MiMo Community' }],
  openGraph: {
    title: 'MiMo GitHub Repo Doctor',
    description: 'AI-powered repository analysis tool',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
