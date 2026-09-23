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
import PortfolioPage from './pages/PortfolioPage';
import CrowdCalendarPage from './pages/CrowdCalendarPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostPage from './pages/BlogPostPage';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            { <Route index element={<HomePage />} /> }
            <Route path="portfolio" element={<PortfolioPage />} />

            {/* <Route path="hotels" element={<SearchPage />} />
            <Route path="hotels/results" element={<ResultsPage />} /> */}

            <Route path="parks" element={<ParkSearchPage />} />
            <Route path="parks/results" element={<ParkResultsPage />} />

            <Route path="crowd-calendar" element={<CrowdCalendarPage />} />

            <Route path="blog" element={<BlogIndexPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />

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
