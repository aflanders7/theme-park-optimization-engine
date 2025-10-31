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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="parks" element={<ParkSearchPage />} />
          <Route path="park-loading" element={<ParkLoadingPage />} />
          <Route path="park-results" element={<ParkResultsPage />} />
        </Route>
        <Route path="loading" element={<LoadingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;