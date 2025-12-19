// src/pages/public/Contact.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.contactHero}>
        <h1 className={styles.contactTitle}>Contact Us</h1>
        <p className={styles.contactSubtitle}>
          We're here to help. Get in touch with us for any questions or support.
        </p>
      </div>

      <div className={styles.contactContainer}>
        <div className={styles.contactInfo}>
          <div className={styles.infoSection}>
            <h2 className={styles.infoTitle}>Get in Touch</h2>
            <p className={styles.infoText}>
              Have questions about HostelHub? Need help with your account or booking? 
              Our team is ready to assist you.
            </p>
          </div>

          <div className={styles.contactDetails}>
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <div className={styles.contactContent}>
                <h3>Email</h3>
                <p>support@hostelhub.com</p>
                <p>info@hostelhub.com</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <FaPhone className={styles.contactIcon} />
              <div className={styles.contactContent}>
                <h3>Phone</h3>
                <p>+233 20 123 4567</p>
                <p>+233 30 987 6543</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <div className={styles.contactContent}>
                <h3>Office</h3>
                <p>University Avenue</p>
                <p>Accra, Ghana</p>
              </div>
            </div>
          </div>

          <div className={styles.businessHours}>
            {/* <h3 className={styles.hoursTitle}>Business Hours</h3> */}
            {/* <div className={styles.hoursGrid}>
              <div className={styles.hourItem}>
                <span>Monday - Friday</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className={styles.hourItem}>
                <span>Saturday</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>
              <div className={styles.hourItem}>
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div> */}
          </div>
        </div>

        <div className={styles.contactFormSection}>
          <h2 className={styles.formTitle}>Send us a Message</h2>
          
          {submitted ? (
            <div className={styles.successMessage}>
              <h3>Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.formLabel}>Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                  placeholder="What is this regarding?"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.formLabel}>Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  required
                  rows="6"
                  placeholder="Type your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={styles.submitButton}
              >
                <FaPaperPlane className={styles.buttonIcon} />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;