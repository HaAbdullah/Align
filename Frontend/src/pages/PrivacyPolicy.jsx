import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: April 6, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">1. What We Collect</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2 leading-relaxed">
                <li><strong className="text-gray-300">Account data</strong> — your name, email address, and profile photo via Google Sign-In (Firebase Authentication).</li>
                <li><strong className="text-gray-300">Payment data</strong> — billing information is processed and stored by Stripe. Align never sees or stores your card details.</li>
                <li><strong className="text-gray-300">Content you provide</strong> — resume text, job descriptions, and other inputs you submit to generate documents. This content is sent to the Claude API (Anthropic) for processing.</li>
                <li><strong className="text-gray-300">Usage data</strong> — how many generations you have used this month, your subscription tier, and timestamps.</li>
              </ul>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">2. How We Use Your Data</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2 leading-relaxed">
                <li>To authenticate you and maintain your account.</li>
                <li>To generate AI-powered documents based on your inputs.</li>
                <li>To enforce subscription tier limits.</li>
                <li>To process payments and manage your subscription via Stripe.</li>
              </ul>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">3. Third-Party Services</h2>
              <p className="text-gray-400 leading-relaxed mb-3">Align relies on the following third-party services:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 leading-relaxed">
                <li><strong className="text-gray-300">Firebase (Google)</strong> — handles authentication. Subject to Google's Privacy Policy.</li>
                <li><strong className="text-gray-300">Stripe</strong> — handles payment processing. Subject to Stripe's Privacy Policy.</li>
                <li><strong className="text-gray-300">Anthropic (Claude API)</strong> — processes resume and cover letter content to generate AI output. Content you submit may be processed on Anthropic's servers per their usage policies.</li>
              </ul>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">4. Data Storage &amp; Security</h2>
              <p className="text-gray-400 leading-relaxed">
                Your data is stored in a cloud database. We use industry-standard security practices including encrypted connections (HTTPS/TLS) and authentication token verification on all API requests. We do not sell your data to third parties.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">5. Data Retention</h2>
              <p className="text-gray-400 leading-relaxed">
                Generated documents are stored until you delete them or close your account. We keep only the 20 most recent documents per user in the recents list. Favorited documents are kept until you unfavorite or delete them.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">6. Your Rights</h2>
              <p className="text-gray-400 leading-relaxed">
                You can delete your documents at any time from the Saved Documents page. To request full account deletion or export of your data, contact us at{" "}
                <a href="mailto:abdullah.hasanjee@gmail.com" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
                  abdullah.hasanjee@gmail.com
                </a>.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">7. Contact</h2>
              <p className="text-gray-400 leading-relaxed">
                Questions about this policy? Email{" "}
                <a href="mailto:abdullah.hasanjee@gmail.com" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
                  abdullah.hasanjee@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          <Link to="/terms" className="text-gray-500 hover:text-gray-400 underline transition-colors">Terms of Service</Link>
          {" · "}
          <Link to="/contact" className="text-gray-500 hover:text-gray-400 underline transition-colors">Contact Us</Link>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
