import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, message } = body;

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        message,
        status: 'pending'
      }
    });

    // Send email in background
    transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <h3>Message:</h3>
        <p>${message}</p>
      `,
    }).catch(error => {
      console.error('Error sending email:', error);
      // Update submission status
      prisma.contactSubmission.update({
        where: { id: submission.id },
        data: { status: 'email_failed' }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Failed to process your submission. Please try again.' },
      { status: 500 }
    );
  }
}
