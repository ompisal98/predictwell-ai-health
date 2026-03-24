const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: March 24, 2026</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>PredictWell AI Health ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">2. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Information:</strong> Email address and password when you create an account.</li>
          <li><strong>Health Data:</strong> Sleep hours, daily steps, sedentary hours, typing speed, voice stress scores, and other health metrics you manually enter.</li>
          <li><strong>Google Fit Data:</strong> If you connect Google Fit, we access your daily step count data. We only read step data and do not modify any data in your Google Fit account.</li>
          <li><strong>Profile Information:</strong> Name, age, weight, gender, and lifestyle type you optionally provide.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide health risk assessments and lifestyle scores.</li>
          <li>To display trends and historical health data.</li>
          <li>To generate personalized health insights via our AI chatbot.</li>
          <li>To sync step data from Google Fit for a more complete health picture.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">4. Google Fit Data Usage</h2>
        <p>Our use of Google Fit data complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We only access daily step count data.</li>
          <li>Data is stored securely and associated with your account.</li>
          <li>We do not share Google Fit data with third parties.</li>
          <li>We do not use Google Fit data for advertising.</li>
          <li>You can disconnect Google Fit at any time.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">5. Data Storage & Security</h2>
        <p>Your data is stored securely using industry-standard encryption. We use row-level security policies to ensure users can only access their own data. OAuth tokens for Google Fit are stored encrypted and are only used to sync your step data.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">6. Data Sharing</h2>
        <p>We do not sell, trade, or share your personal or health data with third parties. Your data is only used within the application to provide you with health insights.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">7. Your Rights</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access and view all your stored health data.</li>
          <li>Delete your account and all associated data.</li>
          <li>Disconnect third-party integrations like Google Fit.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">8. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us through the application.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
