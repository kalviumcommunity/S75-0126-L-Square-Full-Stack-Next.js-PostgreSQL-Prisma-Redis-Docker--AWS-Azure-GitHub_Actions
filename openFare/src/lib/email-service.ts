/**
 * Internal Email Service
 * 
 * This is a server-side only service that sends emails directly
 * without going through the API endpoint (bypasses authentication).
 * 
 * Use this in your API routes for sending emails.
 */

import sendgrid from "@sendgrid/mail";

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn("⚠️ SENDGRID_API_KEY is not set. Emails will not be sent.");
}

if (process.env.SENDGRID_API_KEY) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using SendGrid
 * @param params - Email parameters
 * @returns Success status and message ID
 */
export async function sendEmail(params: SendEmailParams) {
  try {
    const { to, subject, html } = params;

    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, html");
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.log("📧 [DEV MODE] Email would be sent to:", to);
      console.log("Subject:", subject);
      return {
        success: true,
        messageId: "dev-mode-no-send",
        devMode: true,
      };
    }

    // Send email
    const response = await sendgrid.send({
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", {
      to,
      subject,
      statusCode: response[0].statusCode,
      messageId: response[0].headers["x-message-id"],
    });

    return {
      success: true,
      messageId: response[0].headers["x-message-id"],
      statusCode: response[0].statusCode,
    };
  } catch (error: any) {
    console.error("❌ Email send failed:", {
      message: error.message,
      code: error.code,
      response: error.response?.body,
    });

    return {
      success: false,
      error: error.message || "Failed to send email",
      details: error.response?.body?.errors || [],
    };
  }
}

/**
 * Send email with a template
 * @param to - Recipient email
 * @param subject - Email subject
 * @param template - HTML template string
 */
export async function sendTemplateEmail(
  to: string,
  subject: string,
  template: string
) {
  return sendEmail({ to, subject, html: template });
}