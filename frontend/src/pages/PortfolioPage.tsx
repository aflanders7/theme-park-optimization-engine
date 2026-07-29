import { Github, Server, Sparkles } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--snow)] via-[var(--pink)] to-[var(--snow)] py-20 px-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Portfolio Project</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Unofficial Recommendation Tool<br/>
            <span className="bg-gradient-to-r from-yellow-100 to-white bg-clip-text text-transparent">
              Full-Stack App
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
            A full-stack web application for planning optimized theme park itineraries.
          </p>

          <div className="mt-8 rounded-3xl bg-white/15 border border-white/30 backdrop-blur-sm p-5 text-white/90">
            The frontend is deployed for portfolio purposes. The backend API is currently offline, so interactive features are unavailable.
          </div>

          <a
            href="https://github.com/aflanders7"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg text-gray-800 hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <Github className="w-6 h-6" />
            View Source on GitHub
          </a>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-16 left-8 w-48 h-48 bg-yellow-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-8 w-56 h-56 bg-yellow-400/20 rounded-full blur-3xl" />
      </section>

      {/* Project Overview */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--sunset)] to-[var(--rose)] text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Overview
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">What This Project Demonstrates</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              A practical planning tool built around user preferences, date constraints, recommendation logic, and a separated frontend/backend architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 border-2 border-[var(--charcoal)] overflow-hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--sunset)] to-[var(--rose)] rounded-2xl shadow-lg mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Time-Series ML Forecasting</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                Uses historical data and machine learning predictions to estimate crowd levels and generate personalized itineraries based on trip dates, preferences, and scheduling constraints.
              </p>
              <div className="flex flex-wrap gap-2">
                <FeatureTag text="Algorithmic Recommendations" color="orange" />
                <FeatureTag text="Data Scraping" color="orange" />
                <FeatureTag text="Machine Learning" color="orange" />
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[var(--pale)] to-[var(--pink)] rounded-3xl p-8 border-2 border-[var(--charcoal)] overflow-hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--rose)] to-[var(--pink)] rounded-2xl shadow-lg mb-5">
                <Server className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Full-Stack Architecture</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                Uses a React frontend with a FastAPI backend, typed request/response models, database-backed data, and deployable app structure.
              </p>
              <div className="flex flex-wrap gap-2">
                <FeatureTag text="REST API" color="pink" />
                <FeatureTag text="Data Models" color="pink" />
                <FeatureTag text="Frontend State" color="pink" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--pink)] to-[var(--rose)] text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Tech Stack
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Built With</h2>

          <div className="flex flex-wrap justify-center gap-3">
            <TechTag text="React" />
            <TechTag text="TypeScript" />
            <TechTag text="Vite" />
            <TechTag text="Python" />
            <TechTag text="FastAPI" />
            <TechTag text="PostgreSQL" />
            <TechTag text="Pandas" />
            <TechTag text="Tailwind CSS" />
          </div>
        </div>
      </section>

    </div>
  );
}

interface FeatureTagProps {
  text: string;
  color: 'orange' | 'pink';
}

function FeatureTag({ text, color }: FeatureTagProps) {
  const styles = {
    orange: 'text-orange-700 border-orange-300 bg-orange-50',
    pink: 'text-pink-700 border-pink-300 bg-pink-50',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${styles[color]}`}>
      {text}
    </span>
  );
}

function TechTag({ text }: { text: string }) {
  return (
    <span className="text-sm font-bold px-4 py-2 rounded-full border border-[var(--charcoal)] bg-white text-gray-700">
      {text}
    </span>
  );
}
