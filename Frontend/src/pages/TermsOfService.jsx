const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Last updated: April 6, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            By creating an account or using Align, you agree to these Terms of
            Service. If you do not agree, do not use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            2. Subscription & Billing
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Align offers both free and paid subscription tiers. Paid
            subscriptions are billed monthly or annually through Stripe.
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            <li>
              Subscriptions renew automatically unless cancelled before the
              renewal date.
            </li>
            <li>
              You may cancel at any time from your Dashboard. Access continues
              until the end of the billing period.
            </li>
            <li>
              Refunds: We offer a 30-day money-back guarantee on first
              purchases. Contact us at{" "}
              <a
                href="mailto:hasanjeenterprise@gmail.com"
                className="text-green-700 dark:text-emerald-400 underline"
              >
                hasanjeenterprise@gmail.com
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            3. Usage Limits
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Each subscription tier includes a monthly generation limit (resumes,
            cover letters, and interview questions combined). Limits reset on
            the same day each month. Unused generations do not carry over.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            4. AI-Generated Content Disclaimer
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Align uses large language models (Claude by Anthropic) to generate
            resume and cover letter content. AI-generated content may contain
            inaccuracies. You are responsible for reviewing, editing, and
            verifying all content before submitting it to employers. Align is a
            tool to assist you — not a substitute for your own judgment.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            5. Acceptable Use
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            <li>Use the service for any illegal purpose.</li>
            <li>
              Attempt to reverse-engineer, scrape, or abuse the API in ways
              that exceed your plan.
            </li>
            <li>
              Share your account credentials or allow others to use your
              account to circumvent usage limits.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            6. Intellectual Property
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You retain ownership of any content you upload (your resume, job
            descriptions). Align does not claim ownership of documents you
            generate using the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Align is provided "as is." To the maximum extent permitted by law,
            we are not liable for any indirect, incidental, or consequential
            damages arising from your use of the service, including missed job
            opportunities or losses resulting from AI-generated content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            8. Changes to Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We may update these terms from time to time. Continued use of Align
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            9. Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Questions? Email us at{" "}
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

export default TermsOfService;
