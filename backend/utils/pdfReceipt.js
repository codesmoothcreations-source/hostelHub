import PDFDocument from 'pdfkit';

const generateReceipt = (booking, hostel, student) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Header
      doc.fontSize(20).text('HostelHub', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text('Booking Receipt', { align: 'center' });
      doc.moveDown();
      
      // Horizontal line
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke();
      doc.moveDown();
      
      // Receipt details
      doc.fontSize(12);
      doc.text(`Receipt Number: ${booking.reference}`);
      doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`);
      doc.moveDown();
      
      // Student details
      doc.fontSize(14).text('Student Details:', { underline: true });
      doc.fontSize(12);
      doc.text(`Name: ${student.name}`);
      doc.text(`Email: ${student.email}`);
      doc.text(`Phone: ${student.phone || 'Not provided'}`);
      doc.moveDown();
      
      // Hostel details
      doc.fontSize(14).text('Hostel Details:', { underline: true });
      doc.fontSize(12);
      doc.text(`Name: ${hostel.name}`);
      doc.text(`Address: ${hostel.location.address}`);
      doc.text(`Owner: To be populated`);
      doc.moveDown();
      
      // Booking details
      doc.fontSize(14).text('Booking Details:', { underline: true });
      doc.fontSize(12);
      doc.text(`Amount: ${process.env.CURRENCY_SYMBOL || 'GH₵'} ${booking.amount.toFixed(2)}`);
      doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`);
      doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleString()}`);
      doc.moveDown();
      
      // Payment method
      if (booking.paymentMeta.gateway_response) {
        doc.fontSize(14).text('Payment Information:', { underline: true });
        doc.fontSize(12);
        doc.text(`Gateway: Paystack`);
        doc.text(`Transaction ID: ${booking.paystackReference || 'N/A'}`);
        doc.text(`Channel: ${booking.paymentMeta.channel || 'N/A'}`);
        doc.moveDown();
      }
      
      // Terms and conditions
      doc.fontSize(10);
      doc.text('Terms and Conditions:', { underline: true });
      doc.text('1. This receipt is proof of payment.');
      doc.text('2. Please present this receipt when checking in.');
      doc.text('3. Cancellation policy applies as per hostel rules.');
      doc.text('4. For any queries, contact support@hostelhub.com');
      doc.moveDown();
      
      // Footer
      doc.fontSize(8);
      doc.text('Thank you for choosing HostelHub!', { align: 'center' });
      doc.text('www.hostelhub.com | support@hostelhub.com', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generateReceipt;