// src/pages/public/Terms.jsx
import React from 'react';

const Terms = () => {
  return (
    <div className="hostelhub-terms-page">
      <div className="hostelhub-terms-header">
        <h1 className="hostelhub-terms-title">Terms of Service</h1>
        <p className="hostelhub-terms-subtitle">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="hostelhub-terms-content">
        <section className="hostelhub-terms-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using HostelHub, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section className="hostelhub-terms-section">
          <h2>2. User Accounts</h2>
          <p>
            You must create an account to use certain features. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Keeping your contact information up to date</li>
          </ul>
        </section>

        <section className="hostelhub-terms-section">
          <h2>3. Hostel Listings</h2>
          <p>
            Hostel owners are responsible for:
          </p>
          <ul>
            <li>Providing accurate and complete hostel information</li>
            <li>Maintaining the accuracy of listings</li>
            <li>Honoring bookings and reservations</li>
            <li>Complying with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className="hostelhub-terms-section">
          <h2>4. Bookings and Payments</h2>
          <p>
            All bookings are subject to:
          </p>
          <ul>
            <li>Availability confirmation by the hostel owner</li>
            <li>Successful payment processing</li>
            <li>Cancellation policies of individual hostels</li>
            <li>Payment processing through Paystack</li>
          </ul>
        </section>

        <section className="hostelhub-terms-section">
          <h2>5. Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use the service for any illegal purpose</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Post false, inaccurate, or misleading information</li>
            <li>Interfere with the proper working of the service</li>
            <li>Bypass any security or access controls</li>
          </ul>
        </section>

        <section className="hostelhub-terms-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            HostelHub shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section className="hostelhub-terms-section">
          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify 
            users of any material changes via email or through the service.
          </p>
        </section>

        <section className="hostelhub-terms-section">
          <h2>8. Contact Information</h2>
          <p>
            For questions about these Terms of Service, contact us at:
          </p>
          <p>
            <strong>Email:</strong> legal@hostelhub.com<br />
            <strong>Address:</strong> University Avenue, Accra, Ghana
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;