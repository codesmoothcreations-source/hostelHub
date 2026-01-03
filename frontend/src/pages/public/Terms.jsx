// src/pages/public/Terms.jsx
import React from 'react';
import styles from './Terms.module.css';

const Terms = () => {
  return (
    <div className={styles.termsPage}>
      <div className={styles.termsHeader}>
        <span className={styles.headerTag}>Usage Policy</span>
        <h1 className={styles.termsTitle}>Terms of Service</h1>
        <p className={styles.termsSubtitle}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className={styles.termsContent}>
        <div className={styles.acceptanceBox}>
          <h3>Please Read Carefully</h3>
          <p>
            By accessing or using HostelHub, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the service.
          </p>
        </div>

        <section className={styles.termsSection}>
          <h2>1. Agreement to Terms</h2>
          <p>
            These terms constitute a legally binding agreement between you and HostelHub 
            concerning your access to and use of our platform and services.
          </p>
        </section>

        <section className={styles.termsSection}>
          <h2>2. User Accounts</h2>
          <p>
            You must create an account to use certain features. You are responsible for:
          </p>
          <ul className={styles.customList}>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Keeping your contact information up to date</li>
          </ul>
        </section>

        <section className={styles.termsSection}>
          <h2>3. Hostel Listings</h2>
          <p>
            Hostel owners are responsible for:
          </p>
          <ul className={styles.customList}>
            <li>Providing accurate and complete hostel information</li>
            <li>Maintaining the accuracy of listings</li>
            <li>Honoring bookings and reservations</li>
            <li>Complying with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className={styles.termsSection}>
          <h2>4. Bookings and Payments</h2>
          <p>
            All bookings are subject to:
          </p>
          <ul className={styles.customList}>
            <li>Availability confirmation by the hostel owner</li>
            <li>Successful payment processing through Paystack</li>
            <li>Cancellation policies of individual hostels</li>
            <li>Platform service fees where applicable</li>
          </ul>
        </section>

        <section className={styles.termsSection}>
          <h2>5. Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul className={styles.customList}>
            <li>Use the service for any illegal purpose</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Post false, inaccurate, or misleading information</li>
            <li>Interfere with the proper working of the service</li>
            <li>Bypass any security or access controls</li>
          </ul>
        </section>

        <section className={styles.termsSection}>
          <h2>6. Limitation of Liability</h2>
          <p>
            HostelHub shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section className={styles.termsSection}>
          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify 
            users of any material changes via email or through the service.
          </p>
        </section>

        <section className={styles.termsSection}>
          <h2>8. Contact Information</h2>
          <p>
            For questions about these Terms of Service, contact our legal team:
          </p>
          <div className={styles.contactCard}>
            <p>
              <strong>Email:</strong> legal@hostelhub.com
            </p>
            <p>
              <strong>Address:</strong> University Avenue, Accra, Ghana
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Terms;