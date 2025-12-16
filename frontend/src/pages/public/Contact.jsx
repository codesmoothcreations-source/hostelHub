// src/pages/public/Contact.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import "./Contact.css"

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
    <div className="hostelhub-contact-page">
      <div className="hostelhub-contact-hero">
        <h1 className="hostelhub-contact-title">Contact Us</h1>
        <p className="hostelhub-contact-subtitle">
          We're here to help. Get in touch with us for any questions or support.
        </p>
      </div>

      <div className="hostelhub-contact-container">
        <div className="hostelhub-contact-info">
          <div className="hostelhub-info-section">
            <h2 className="hostelhub-info-title">Get in Touch</h2>
            <p className="hostelhub-info-text">
              Have questions about HostelHub? Need help with your account or booking? 
              Our team is ready to assist you.
            </p>
          </div>

          <div className="hostelhub-contact-details">
            <div className="hostelhub-contact-item">
              <FaEnvelope className="hostelhub-contact-icon" />
              <div className="hostelhub-contact-content">
                <h3>Email</h3>
                <p>support@hostelhub.com</p>
                <p>info@hostelhub.com</p>
              </div>
            </div>

            <div className="hostelhub-contact-item">
              <FaPhone className="hostelhub-contact-icon" />
              <div className="hostelhub-contact-content">
                <h3>Phone</h3>
                <p>+233 20 123 4567</p>
                <p>+233 30 987 6543</p>
              </div>
            </div>

            <div className="hostelhub-contact-item">
              <FaMapMarkerAlt className="hostelhub-contact-icon" />
              <div className="hostelhub-contact-content">
                <h3>Office</h3>
                <p>University Avenue</p>
                <p>Accra, Ghana</p>
              </div>
            </div>
          </div>

          <div className="hostelhub-business-hours">
            {/* <h3 className="hostelhub-hours-title">Business Hours</h3> */}
            {/* <div className="hostelhub-hours-grid">
              <div className="hostelhub-hour-item">
                <span>Monday - Friday</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className="hostelhub-hour-item">
                <span>Saturday</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>
              <div className="hostelhub-hour-item">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div> */}
          </div>
        </div>

        <div className="hostelhub-contact-form-section">
          <h2 className="hostelhub-form-title">Send us a Message</h2>
          
          {submitted ? (
            <div className="hostelhub-success-message">
              <h3>Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="hostelhub-contact-form">
              <div className="hostelhub-form-group">
                <label htmlFor="name" className="hostelhub-form-label">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="hostelhub-form-input"
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className="hostelhub-form-group">
                <label htmlFor="email" className="hostelhub-form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="hostelhub-form-input"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="hostelhub-form-group">
                <label htmlFor="subject" className="hostelhub-form-label">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="hostelhub-form-input"
                  required
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="hostelhub-form-group">
                <label htmlFor="message" className="hostelhub-form-label">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="hostelhub-form-textarea"
                  required
                  rows="6"
                  placeholder="Type your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="hostelhub-submit-button"
              >
                <FaPaperPlane className="hostelhub-button-icon" />
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