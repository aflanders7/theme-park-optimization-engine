// frontend/src/pages/PrivacyPolicyPage.tsx
import { Mail, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 30, 2025"; 
  const websiteName = "Disney Vacation Planner";
  const contactEmail = "privacy@yourdomain.com"; 
  const websiteUrl = "https://yourdomain.com"; 

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: {lastUpdated}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to {websiteName}. Your privacy is important to us.
              This Privacy Policy explains how we collect, use, and protect your information when you
              use our website and services.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              By using our website or submitting your information, you agree to this Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">2. Information We Collect</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect only the information necessary to provide personalized travel recommendations and updates.
            </p>

            <div className="rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">Information you provide directly:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>First name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Trip details (including travel dates, party size, budget range)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Ages of children (used only for recommendations, not permanently stored)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Preferences for hotels and theme parks</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">Automatically collected information:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Page visits, referral sources, and browser type</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Device information and IP address (for analytics and security)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">3. How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">We use the collected information to:</p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">•</span>
                <span>Generate personalized travel recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">•</span>
                <span>Send opt-in marketing or informational emails (only if you subscribe)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">•</span>
                <span>Improve our website and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">•</span>
                <span>Respond to your inquiries and provide customer support</span>
              </li>
            </ul>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4">
              <p className="text-gray-800 font-semibold">
                We do not sell, rent, or trade your personal data with third parties.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar technologies to enhance your experience. These include:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Essential cookies:</strong> Required for website functionality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Analytics cookies:</strong> Help us understand how visitors use our site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Preference cookies:</strong> Remember your settings and choices</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information only as long as necessary to fulfill the purposes
              outlined above or as required by law. Child age data is used only during recommendation
              processing and is not stored permanently after results are generated.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">6. Data Sharing and Third Parties</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your data only with trusted service providers:
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 mb-2">
                <strong>Brevo (Sendinblue):</strong> Our email and marketing automation provider for
                secure email delivery and contact management. View their{' '}
                <a href="https://www.brevo.com/legal/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline">
                  Privacy Policy
                </a>.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We do not share personal information with any other third parties except as required by law
              or to protect our rights.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to external sites (such as Disney, etc.).
              We are not responsible for the privacy practices of these third-party sites. We encourage
              you to review their privacy policies.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is intended for use by adults. While we may temporarily collect limited information such as the ages
              of guests to generate recommendations, we do not knowingly collect or store personal information from children
              under 13. If you are a parent or guardian and believe that we may have inadvertently collected such information,
              please contact us immediately and we will promptly delete it.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">9. Your Rights</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--pale)] rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-1">Access & Correction</p>
                <p className="text-sm text-gray-700">View and update your personal information</p>
              </div>
              <div className="bg-[var(--pale)] rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-1">Unsubscribe</p>
                <p className="text-sm text-gray-700">Opt out of marketing emails anytime</p>
              </div>
              <div className="bg-[var(--pale)] rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-1">Data Deletion</p>
                <p className="text-sm text-gray-700">Request permanent deletion of your data</p>
              </div>
              <div className="bg-[var(--pale)] rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-1">Data Portability</p>
                <p className="text-sm text-gray-700">Receive a copy of your information</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href={`mailto:${contactEmail}`} className="text-purple-600 hover:underline font-semibold">{contactEmail}</a>.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your data in accordance with
              this Privacy Policy.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We take appropriate technical and organizational measures to protect your personal information
              from unauthorized access, alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy occasionally to reflect changes in our practices or legal
              requirements. The "Last Updated" date at the top reflects the most recent version.
            </p>
          </section>

          {/* Contact Section */}
          <section className="bg-[var(--lpink)] rounded-2xl p-8 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">13. Contact Us</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy or how your information is handled,
              please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-800 font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <a href={`mailto:${contactEmail}`} className="hover:underline">{contactEmail}</a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>This privacy policy is effective as of {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}