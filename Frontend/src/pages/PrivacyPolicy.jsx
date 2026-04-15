const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Last updated: April 6, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            1. What We Collect
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>
              <strong>Account data</strong> — your name, email address, and
              profile photo via Google Sign-In (Firebase Authentication).
            </li>
            <li>
              <strong>Payment data</strong> — billing information is processed
              and stored by Stripe. Align never sees or stores your card
              details.
            </li>
            <li>
              <strong>Content you provide</strong> — resume text, job
              descriptions, and other inputs you submit to generate documents.
              This content is sent to the Claude API (Anthropic) for
              processing.
            </li>
            <li>
              <strong>Usage data</strong> — how many generations you have used
              this month, your subscription tier, and timestamps.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            2. How We Use Your Data
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            <li>To authenticate you and maintain your account.</li>
            <li>To generate AI-powered documents based on your inputs.</li>
            <li>To enforce subscription tier limits.</li>
            <li>To process payments and manage your subscription via Stripe.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            3. Third-Party Services
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Align relies on the following third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>
              <strong>Firebase (Google)</strong> — handles authentication.
              Subject to Google's Privacy Policy.
            </li>
            <li>
              <strong>Stripe</strong> — handles payment processing. Subject to
              Stripe's Privacy Policy.
            </li>
            <li>
              <strong>Anthropic (Claude API)</strong> — processes resume and
              cover letter content to generate AI output. Content you submit
              may be processed on Anthropic's servers per their usage policies.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            4. Data Storage & Security
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your data is stored in a cloud database. We use industry-standard
            security practices including encrypted connections (HTTPS/TLS) and
            authentication token verification on all API requests. We do not
            sell your data to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            5. Data Retention
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Generated documents are stored until you delete them or close your
            account. We keep only the 20 most recent documents per user in the
            recents list. Favorited documents are kept until you unfavorite or
            delete them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            6. Your Rights
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You can delete your documents at any time from the Saved Documents
            page. To request full account deletion or export of your data,
            contact us at{" "}
            <a
              href="mailto:hasanjeenterprise@gmail.com"
              className="text-green-700 dark:text-emerald-400 underline"
            >
              hasanjeenterprise@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            7. Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Questions about this policy? Email{" "}
            <a
              href="mailto:hasanjeenterprise@gmail.com"
              className="text-green-700 dark:text-emerald-400 underline"
            >
              hasanjeenterprise@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
