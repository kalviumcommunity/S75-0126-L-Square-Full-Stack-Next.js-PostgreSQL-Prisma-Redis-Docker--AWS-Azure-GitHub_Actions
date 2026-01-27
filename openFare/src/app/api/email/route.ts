import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY is not defined in environment variables");
}

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, message, template } = await req.json();

    // Validate required fields
    if (!to || !subject || (!message && !template)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: to, subject, and message/template" 
        },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData = {
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      html: message || template,
    };

    console.log(`Attempting to send email to: ${to}`);

    // Send email via SendGrid
    const response = await sendgrid.send(emailData);
    
    console.log("✅ Email sent successfully:", {
      to,
      subject,
      statusCode: response[0].statusCode,
      messageId: response[0].headers["x-message-id"],
    });

    return NextResponse.json({ 
      success: true,
      messageId: response[0].headers["x-message-id"],
      statusCode: response[0].statusCode,
    });

  } catch (error: any) {
    console.error("❌ Email send failed:", {
      message: error.message,
      code: error.code,
      response: error.response?.body,
    });

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to send email",
        details: error.response?.body?.errors || [],
      },
      { status: 500 }
    );
  }
}