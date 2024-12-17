import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
})

async function processEmails() {
  try {
    // Get all pending submissions
    const pendingSubmissions = await prisma.contactSubmission.findMany({
      where: {
        status: 'pending'
      }
    })

    for (const submission of pendingSubmissions) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: process.env.CONTACT_EMAIL,
          subject: `New Contact Form Submission from ${submission.firstName} ${submission.lastName}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${submission.firstName} ${submission.lastName}</p>
            <p><strong>Email:</strong> ${submission.email}</p>
            <p><strong>Phone:</strong> ${submission.phone || 'Not provided'}</p>
            <h3>Message:</h3>
            <p>${submission.message}</p>
          `,
        })

        // Update status to sent
        await prisma.contactSubmission.update({
          where: { id: submission.id },
          data: { status: 'sent' }
        })

      } catch (error) {
        console.error(`Failed to send email for submission ${submission.id}:`, error)
        
        // Mark as failed
        await prisma.contactSubmission.update({
          where: { id: submission.id },
          data: { status: 'failed' }
        })
      }
    }
  } catch (error) {
    console.error('Error in email processing:', error)
  } finally {
    // Schedule next run
    setTimeout(processEmails, 30000) // Run every 30 seconds
  }
}

// Start the worker
processEmails()
