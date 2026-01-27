/**
 * Email service for sending match notification emails
 * Uses existing Gmail OAuth2 infrastructure from mail.router.js
 */

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const pool = require("../modules/pool");
const {
  tutorMatchEmail,
  tuteeMatchEmail,
  guardianMatchEmail,
} = require("../templates/emailTemplates");

/**
 * Create OAuth2 authenticated transporter
 */
async function createTransporter() {
  // Check if OAuth2 credentials are configured
  if (
    !process.env.OAUTH_CLIENT_ID ||
    !process.env.OAUTH_CLIENT_SECRET ||
    !process.env.OAUTH_REFRESH_TOKEN ||
    !process.env.MAIL_USER
  ) {
    throw new Error("Email OAuth2 credentials not configured in environment variables");
  }

  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USER,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  return transporter;
}

/**
 * Send a single email
 */
async function sendEmail(transporter, emailData) {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: emailData.to,
    cc: emailData.cc,
    subject: emailData.subject,
    text: emailData.text,
    html: emailData.html,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send all match notification emails (tutor + tutee/guardian)
 * @param {number} matchId - The match ID in the database
 * @param {object} tutor - Tutor data object
 * @param {object} tutee - Tutee data object
 * @returns {object} - { success: boolean, errors: array, emailsSent: array }
 */
async function sendMatchNotifications(matchId, tutor, tutee) {
  const errors = [];
  const emailsSent = [];

  let transporter;
  try {
    transporter = await createTransporter();
  } catch (err) {
    console.error("Failed to create email transporter:", err.message);
    return {
      success: false,
      errors: [{ type: "transporter", message: err.message }],
      emailsSent: [],
    };
  }

  // 1. Send email to tutor
  try {
    const tutorEmail = tutorMatchEmail(tutor, tutee);
    await sendEmail(transporter, tutorEmail);
    emailsSent.push({ type: "tutor", to: tutorEmail.to });
    console.log(`Match ${matchId}: Tutor email sent to ${tutorEmail.to}`);
  } catch (err) {
    console.error(`Match ${matchId}: Failed to send tutor email:`, err.message);
    errors.push({ type: "tutor", message: err.message });
  }

  // 2. Send email to tutee OR guardian based on student_or_guardian field
  const isStudent =
    tutee.student_or_guardian?.toLowerCase() === "student";

  if (isStudent && tutee.email_student) {
    // Send to student directly
    try {
      const studentEmail = tuteeMatchEmail(tutor, tutee);
      await sendEmail(transporter, studentEmail);
      emailsSent.push({ type: "tutee", to: studentEmail.to });
      console.log(`Match ${matchId}: Tutee email sent to ${studentEmail.to}`);
    } catch (err) {
      console.error(`Match ${matchId}: Failed to send tutee email:`, err.message);
      errors.push({ type: "tutee", message: err.message });
    }
  } else if (tutee.email_guardian) {
    // Send to guardian
    try {
      const parentEmail = guardianMatchEmail(tutor, tutee);
      await sendEmail(transporter, parentEmail);
      emailsSent.push({ type: "guardian", to: parentEmail.to });
      console.log(`Match ${matchId}: Guardian email sent to ${parentEmail.to}`);
    } catch (err) {
      console.error(`Match ${matchId}: Failed to send guardian email:`, err.message);
      errors.push({ type: "guardian", message: err.message });
    }
  } else {
    errors.push({
      type: "recipient",
      message: "No valid email address found for tutee or guardian",
    });
  }

  // 3. Update emails_sent flag in database if at least some emails were sent
  if (emailsSent.length > 0) {
    try {
      await pool.query(
        `UPDATE "matches" SET emails_sent = true WHERE id = $1`,
        [matchId]
      );
    } catch (err) {
      console.error(`Match ${matchId}: Failed to update emails_sent flag:`, err.message);
      errors.push({ type: "database", message: err.message });
    }
  }

  return {
    success: errors.length === 0,
    errors,
    emailsSent,
  };
}

module.exports = {
  sendMatchNotifications,
  createTransporter,
  sendEmail,
};
