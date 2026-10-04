import './globals.css';
import { AppProvider } from '@/context/AppContext';
import TopBar from '@/components/TopBar';

export const metadata = {
  title: 'SkillProof - Trade Skill Assessment',
  description: 'Show your skill. Get recognised.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1F3A8A" />
      </head>
      <body>
        <AppProvider>
          <div className="app-container">
            <TopBar />
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
