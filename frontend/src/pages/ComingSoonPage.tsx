import BrevoForm from '../components/BrevoForm';
import { Sparkles, Calendar, MapPin } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--snow)] via-[var(--pink)] to-[var(--snow)] py-20 px-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            New Features<br />
            <span className="bg-gradient-to-r from-yellow-100 to-white bg-clip-text text-transparent">
              Are On Their Way
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
            We're building exciting new tools to make your Disney trip even easier to figure out.
          </p>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-16 left-8 w-48 h-48 bg-yellow-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-8 w-56 h-56 bg-yellow-400/20 rounded-full blur-3xl" />
      </section>

      {/* Email Signup */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-gradient-to-r from-[var(--pink)] to-[var(--rose)] text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            ✉️ Early Access
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Be the First to Know
          </h2>
          <p className="text-gray-500">
            Drop your email and we'll let you know the moment these new tools go live.
          </p>
        </div>
        <BrevoForm />
      </section>

      {/* What's Coming */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--sunset)] to-[var(--rose)] text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              🚧 Under Construction
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">What's Coming Next</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Two new tools are in the works to take the guesswork out of your Disney trip.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Crowd Calendar */}
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 border-2 border-[var(--charcoal)] overflow-hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--sunset)] to-[var(--rose)] rounded-2xl shadow-lg mb-5">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Crowd Calendar</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                See forecasted crowd levels across all Disney World parks for any date range. Spot the light days, avoid the packed ones, and pick your trip dates with confidence.
              </p>
              <div className="flex flex-wrap gap-2">
                <FeatureTag text="Crowd Forecasts" color="orange" />
                <FeatureTag text="Date Comparison" color="orange" />
                <FeatureTag text="All 4 Parks" color="orange" />
              </div>
            </div>

            {/* Ride Guide */}
            <div className="relative bg-gradient-to-br from-[var(--pale)] to-[var(--pink)] rounded-3xl p-8 border-2 border-[var(--charcoal)] overflow-hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--rose)] to-[var(--pink)] rounded-2xl shadow-lg mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Full-Day Ride Guide</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                Get a personalized ride-by-ride guide for your park day. Built around your party, your must-dos, and the crowd forecast, so you can make the most of every hour.
              </p>
              <div className="flex flex-wrap gap-2">
                <FeatureTag text="Personalized Order" color="pink" />
                <FeatureTag text="Lightning Lane Tips" color="pink" />
                <FeatureTag text="Rest Breaks" color="pink" />
              </div>
            </div>

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