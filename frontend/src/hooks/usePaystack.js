// src/hooks/usePaystack.js
import { useState } from 'react';

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const payWithPaystack = (paymentData) => {
    return new Promise((resolve, reject) => {
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => initializePayment();
        document.head.appendChild(script);
      } else {
        initializePayment();
      }

      function initializePayment() {
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: paymentData.email,
          amount: paymentData.amount * 100, // Convert to kobo
          ref: paymentData.reference,
          currency: paymentData.currency || 'GHS',
          callback: function(response) {
            resolve(response);
          },
          onClose: function() {
            reject(new Error('Payment window closed'));
          }
        });
        
        handler.openIframe();
      }
    });
  };

  const processPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await payWithPaystack(paymentData);
      setLoading(false);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return { processPayment, loading, error };
};