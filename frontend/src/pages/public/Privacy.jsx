// src/pages/public/Privacy.jsx
import React from 'react';

const Privacy = () => {
  return (
    <div className="hostelhub-privacy-page">
      <div className="hostelhub-privacy-header">
        <h1 className="hostelhub-privacy-title">Privacy Policy</h1>
        <p className="hostelhub-privacy-subtitle">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="hostelhub-privacy-content">
        <section className="hostelhub-privacy-section">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including:
          </p>
          <ul>
            <li>Account information (name, email, phone number)</li>
            <li>Profile information (avatar, location)</li>
            <li>Hostel listings and booking information</li>
            <li>Payment information (processed securely by Paystack)</li>
            <li>Communications with other users</li>
          </ul>
        </section>

        <section className="hostelhub-privacy-section">
          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section className="hostelhub-privacy-section">
          <h2>3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except:
          </p>
          <ul>
            <li>With your consent</li>
            <li>For legal reasons</li>
            <li>With service providers who assist our operations</li>
            <li>In connection with a business transfer</li>
          </ul>
        </section>

        <section className="hostelhub-privacy-section">
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect 
            your personal information against unauthorized access, alteration, 
            disclosure, or destruction.
          </p>
        </section>

        <section className="hostelhub-privacy-section">
          <h2>5. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="hostelhub-privacy-section">
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> privacy@hostelhub.com<br />
            <strong>Address:</strong> University Avenue, Accra, Ghana
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;