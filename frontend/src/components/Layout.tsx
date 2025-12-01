// frontend/src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--snow)] via-[var(--pale)] to-[var(--snow)]">
      <Navbar />
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}