// frontend/src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { Search, DollarSign, Clock, Sparkles, Star, TrendingUp, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Personalized Hotel Recommendations</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Disney Hotel
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Answer a few questions and get personalized hotel recommendations based on your budget, preferences, and travel style.
            </p>
            
            <Link
              to="/search"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <Search className="w-6 h-6" />
              Start Planning Your Trip
            </Link>

            <p className="text-white/80 text-sm mt-4">
              Takes less than 2 minutes • No account required
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our smart algorithm finds the perfect hotel match for your Disney vacation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="w-12 h-12" />}
              title="Answer Simple Questions"
              description="Tell us about your travel dates, party size, and budget. We'll handle the rest."
              step="1"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Smart Recommendations"
              description="Our algorithm analyzes pricing, location, amenities, and your preferences to find the best matches."
              step="2"
            />
            <FeatureCard
              icon={<Award className="w-12 h-12" />}
              title="Book with Confidence"
              description="Get detailed breakdowns, match scores, and personalized reasons for each recommendation."
              step="3"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Why Use Disney Planner?
              </h2>
              <div className="space-y-6">
                <Benefit
                  icon={<DollarSign className="w-6 h-6" />}
                  title="Maximize Your Budget"
                  description="Find the best value hotels that fit your budget and save money for park tickets and dining."
                />
                <Benefit
                  icon={<Clock className="w-6 h-6" />}
                  title="Save Hours of Research"
                  description="Skip endless comparisons and review sites. Get personalized recommendations in minutes."
                />
                <Benefit
                  icon={<Sparkles className="w-6 h-6" />}
                  title="Personalized Matches"
                  description="Not all hotels are created equal. We find the ones that match YOUR specific needs and preferences."
                />
                <Benefit
                  icon={<Star className="w-6 h-6" />}
                  title="Expert Insights"
                  description="Get detailed explanations for why each hotel is recommended, including transportation, amenities, and more."
                />
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Pop Century Resort</h4>
                      <p className="text-sm text-gray-600">Value Tier</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">$165/night</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      87% Match
                    </span>
                  </div>
                </div>
                <div className="text-center text-gray-600 font-medium">
                  Sample Recommendation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Hotel?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of families who have found their ideal Disney accommodations
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <Search className="w-6 h-6" />
            Start Your Search Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <span className="text-xl font-bold">Disney Planner</span>
          </div>
          <p className="text-gray-400 mb-4">
            Unofficial Disney vacation planning tool
          </p>
          <p className="text-sm text-gray-500">
            Not affiliated with The Walt Disney Company
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: string;
}

function FeatureCard({ icon, title, description, step }: FeatureCardProps) {
  return (
    <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {step}
      </div>
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Benefit({ icon, title, description }: BenefitProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}