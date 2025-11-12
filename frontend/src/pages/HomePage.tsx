// frontend/src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import BrevoForm from '../components/BrevoForm';
import { Search, Sparkles, Star, Hotel, Users, MapPin, Bus } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--snow)] via-[var(--pink)] to-[var(--snow)] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Unofficial Recommendation Tool</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <br />
              <span className="bg-gradient-to-r from-yellow-100 to-white bg-clip-text text-transparent">
                Disney Stay & Experience
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Get personalized suggestions for the perfect resort and park visit — all based on your travel style.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/search"
                className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Hotel className="w-6 h-6" />
                Get Hotel Suggestions
              </Link>

              <Link
                to="/parks"
                className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Sparkles className="w-6 h-6" />
                Get Park Suggestions
              </Link>
            </div>

            <p className="text-white/80 text-sm mt-4">
              Takes less than 2 minutes • No account required
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-50 h-50 bg-yellow-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-yellow-400/20 rounded-full blur-3xl"></div>
      </section>

      {/* Brevo Form embedded */}
      <BrevoForm />

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Two Helpful Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get suggestions for your Disney resort stay and park visits
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Hotel Suggestions */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-8 border-2 border-orange-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full mb-4 shadow-lg">
                  <Hotel className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hotel Suggestions</h3>
                <p className="text-gray-600">Find your perfect Disney resort</p>
              </div>
              
              <div className="space-y-4">
                <FeatureItem text="Personalized hotel matches" />
                <FeatureItem text="All resort categories" />
                <FeatureItem text="Detailed amenities & location info" />
                <FeatureItem text="Transportation details" />
              </div>

              <Link
                to="/search"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Hotel className="w-5 h-5" />
                Find Hotels
              </Link>
            </div>

            {/* Park Day Planner */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Park Visit Suggestions</h3>
                <p className="text-gray-600">See which parks to visit when</p>
              </div>
              
              <div className="space-y-4">
                <FeatureItem text="Suggestions based on crowd forecasts" />
                <FeatureItem text="Tailored to your party & preferences" />
                <FeatureItem text="Rest day suggestions included" />
                <FeatureItem text="Daily tips & suggested arrival times" />
              </div>

              <Link
                to="/parks"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Get Park Suggestions
              </Link>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">How Our Tools Work</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              icon={<Search className="w-12 h-12" />}
              title="Share Your Details"
              description="Tell us about your travel dates, party size, and preferences."
              step="1"
            />
            <StepCard
              icon={<Sparkles className="w-12 h-12" />}
              title="Get Suggestions"
              description="Our algorithms analyze your inputs and provide personalized suggestions."
              step="2"
            />
            <StepCard
              icon={<Star className="w-12 h-12" />}
              title="Review & Explore"
              description="Browse detailed information to help inform your decisions."
              step="3"
            />
          </div>
        </div>
      </section>

      {/* Why Use This Tool Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Why Use Our Suggestion Tool?
              </h2>
              <div className="space-y-6">
                <Benefit
                  icon={<Star className="w-6 h-6" />}
                  title="Tailored to Your Needs"
                  description="Get suggestions based on your specific party size, dates, and preferences."
                />
                <Benefit
                  icon={<Search className="w-6 h-6" />}
                  title="Save Time Searching"
                  description="Skip endless comparisons. Get focused suggestions that match what you're looking for."
                />
                <Benefit
                  icon={<Sparkles className="w-6 h-6" />}
                  title="Helpful Context"
                  description="See why each hotel is suggested with details about amenities, location, and transportation."
                />
                <Benefit
                  icon={<Hotel className="w-6 h-6" />}
                  title="All Resort Categories"
                  description="Explore options across value, moderate, and deluxe resort categories."
                />
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  {/* Sample Hotel Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-sm font-bold mb-2">
                        1
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">Disney's All-Star Movies Resort</h4>
                      <p className="text-sm text-gray-600">Standard Room</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        Value
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        Sleeps 4
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Why we suggest this:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">✓</span>
                          <span>Perfect fit for 4 guests</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">✓</span>
                          <span>Value tier hotel</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Bus className="w-4 h-4" />
                        <span>Bus</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">Animal Kingdom Area</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-gray-600 font-medium mt-4">
                  Sample Suggestion
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What You'll Get
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each hotel suggestion includes helpful information to guide your decision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <InfoCard
              icon={<Hotel className="w-8 h-8" />}
              title="Hotel Details"
              items={["Room type", "Resort category", "Guest capacity", "Amenities"]}
            />
            <InfoCard
              icon={<MapPin className="w-8 h-8" />}
              title="Location Info"
              items={["Resort area", "Park proximity", "Transportation options", "Walking distance"]}
            />
            <InfoCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Match Reasoning"
              items={["Why it fits your group", "Key features", "Best suited for", "Considerations"]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 via-pink-500 to-yellow-400">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Suggestions?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Find hotel options and see which parks to visit when
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <Hotel className="w-6 h-6" />
              Find Hotels
            </Link>
            <Link
              to="/parks"
              className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-6 h-6" />
              Get Park Suggestions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: string;
}

function StepCard({ icon, title, description, step }: StepCardProps) {
  return (
    <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-orange-100">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {step}
      </div>
      <div className="text-orange-600 mb-4">{icon}</div>
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
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center text-orange-600">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

function InfoCard({ icon, title, items }: InfoCardProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-100">
      <div className="text-orange-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2 text-gray-700">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
        <span className="text-orange-600 font-bold text-sm">✓</span>
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}