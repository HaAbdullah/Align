import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-16 px-4">
      <SEO
        title="Terms of Service"
        description="Read Align's Terms of Service — subscriptions, billing, usage limits, and our 30-day money-back guarantee."
        canonicalPath="/terms"
      />
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white mb-1">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: April 6, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                By creating an account or using Align, you agree to these Terms of Service. If you do not agree, do not use the service.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">2. Subscription &amp; Billing</h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                Align offers both free and paid subscription tiers. Paid subscriptions are billed monthly or annually through Stripe.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 leading-relaxed">
                <li>Subscriptions renew automatically unless cancelled before the renewal date.</li>
                <li>You may cancel at any time from your Dashboard. Access continues until the end of the billing period.</li>
                <li>
                  Refunds: We offer a 30-day money-back guarantee on first purchases. Contact us at{" "}
                  <a href="mailto:abdullah.hasanjee@gmail.com" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
                    abdullah.hasanjee@gmail.com
                  </a>.
                </li>
              </ul>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">3. Usage Limits</h2>
              <p className="text-gray-400 leading-relaxed">
                Each subscription tier includes a monthly generation limit (resumes, cover letters, and interview questions combined). Limits reset on the same day each month. Unused generations do not carry over.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">4. AI-Generated Content Disclaimer</h2>
              <p className="text-gray-400 leading-relaxed">
                Align uses large language models (Claude by Anthropic) to generate resume and cover letter content. AI-generated content may contain inaccuracies. You are responsible for reviewing, editing, and verifying all content before submitting it to employers. Align is a tool to assist you — not a substitute for your own judgment.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">5. Acceptable Use</h2>
              <p className="text-gray-400 leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 leading-relaxed">
                <li>Use the service for any illegal purpose.</li>
                <li>Attempt to reverse-engineer, scrape, or abuse the API in ways that exceed your plan.</li>
                <li>Share your account credentials or allow others to use your account to circumvent usage limits.</li>
              </ul>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">6. Intellectual Property</h2>
              <p className="text-gray-400 leading-relaxed">
                You retain ownership of any content you upload (your resume, job descriptions). Align does not claim ownership of documents you generate using the service.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-400 leading-relaxed">
                Align is provided "as is." To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including missed job opportunities or losses resulting from AI-generated content.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">8. Changes to Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                We may update these terms from time to time. Continued use of Align after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <div className="border-t border-gray-700" />

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">9. Contact</h2>
              <p className="text-gray-400 leading-relaxed">
                Questions? Email us at{" "}
                <a href="mailto:abdullah.hasanjee@gmail.com" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
                  abdullah.hasanjee@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          <Link to="/privacy" className="text-gray-500 hover:text-gray-400 underline transition-colors">Privacy Policy</Link>
          {" · "}
          <Link to="/contact" className="text-gray-500 hover:text-gray-400 underline transition-colors">Contact Us</Link>
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
