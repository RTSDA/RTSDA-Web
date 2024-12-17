import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

export const sendContactEmail = functions.firestore
  .document('contactSubmissions/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.CONTACT_EMAIL,
        subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <h3>Message:</h3>
          <p>${data.message}</p>
        `,
      });

      // Update document to indicate email was sent
      await snap.ref.update({
        emailSent: true,
        emailError: null
      });

    } catch (error) {
      console.error('Error sending email:', error);
      // Update document with error
      await snap.ref.update({
        emailSent: false,
        emailError: error.message
      });
    }
  });
