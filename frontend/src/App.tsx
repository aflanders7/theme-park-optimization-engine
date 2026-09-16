// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ResultsPage from './pages/ResultsPage';
import LoadingPage from './pages/LoadingPage';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import ParkSearchPage from './pages/ParkSearchPage';
import ParkLoadingPage from './pages/ParkLoadingPage';
import ParkResultsPage from './pages/ParkResultsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ConditionsPage from './pages/ConditionsPage';
import ComingSoonPage from './pages/PortfolioPage';
import CrowdCalendarPage from './pages/CrowdCalendarPage';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* <Route index element={<HomePage />} /> */}
            <Route index element={<ComingSoonPage />} />

            <Route path="search" element={<SearchPage />} />
            <Route path="results" element={<ResultsPage />} />

            <Route path="parks" element={<ParkSearchPage />} />
            <Route path="park-results" element={<ParkResultsPage />} />

            <Route path="crowd-calendar" element={<CrowdCalendarPage />} />

            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<ConditionsPage />} />
          </Route>

          <Route path="loading" element={<LoadingPage />} />
          <Route path="park-loading" element={<ParkLoadingPage />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <Analytics />
      <SpeedInsights />
    </>
  );
}



export default App;