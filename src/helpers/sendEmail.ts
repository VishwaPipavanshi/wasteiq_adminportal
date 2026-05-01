import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using nodemailer.
 * Requires EMAIL_USER and EMAIL_PASS in .env (Gmail App Password recommended).
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use a Gmail App Password, not your regular password
    },
  });

  await transporter.sendMail({
    from: `"Clean-AI System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
