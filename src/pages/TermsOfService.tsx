const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last updated: March 24, 2026</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p>By accessing or using PredictWell AI Health ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">2. Description of Service</h2>
        <p>PredictWell AI Health is a health monitoring and risk assessment application that allows users to track health metrics, view trends, and receive AI-powered health insights. The Service may integrate with third-party platforms such as Google Fit to enhance functionality.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">3. User Accounts</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You must provide a valid email address to create an account.</li>
          <li>You are responsible for maintaining the security of your account credentials.</li>
          <li>You must not share your account with others.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">4. Health Disclaimer</h2>
        <p><strong>The Service is for informational purposes only and does not constitute medical advice.</strong> Risk scores, lifestyle assessments, and AI-generated insights are not diagnoses. Always consult a qualified healthcare professional for medical decisions.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">5. Third-Party Integrations</h2>
        <p>The Service may connect to third-party services such as Google Fit. By connecting these services, you authorize us to access the specific data described in our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>. You may disconnect third-party integrations at any time.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">6. Acceptable Use</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Do not misuse or attempt to disrupt the Service.</li>
          <li>Do not attempt to access other users' data.</li>
          <li>Do not use the Service for any unlawful purpose.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
        <p>The Service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service, including reliance on health insights or risk assessments provided by the application.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">8. Termination</h2>
        <p>We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
        <p>We may update these Terms of Service from time to time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">10. Contact</h2>
        <p>If you have questions about these Terms, please contact us through the application.</p>
      </section>
    </div>
  );
};

export default TermsOfService;
