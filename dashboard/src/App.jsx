import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import GalleryPage from './pages/GalleryPage';
import TrackerPage from './pages/TrackerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import OutreachPage from './pages/OutreachPage';
import { loadManifest } from './store/contentStore';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 lg:ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Pre-warm the localStorage cache with manifest data on app load
    loadManifest().catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/outreach" element={<OutreachPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
