import './globals.css';
import { AppProvider } from '@/context/AppContext';
import TopBar from '@/components/TopBar';

export const metadata = {
  title: 'Pramaan-RPL | AI-Assisted Skill Assessment Tool',
  description: 'NCVET Aug 2023 Aligned Evidence & Consistency System for Recognition of Prior Learning',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1E3A8A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <AppProvider>
          <div className="app-container">
            <TopBar />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
