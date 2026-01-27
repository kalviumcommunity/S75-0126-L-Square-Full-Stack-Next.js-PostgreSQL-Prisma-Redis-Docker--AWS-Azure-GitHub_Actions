/**
 * Email Templates for Transparent Intercity Bus Ticket System
 * These templates are used for transactional emails throughout the application
 */

// Welcome email for new user registration
export const welcomeTemplate = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚌 Welcome to L² Bus Ticket System</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName}!</h2>
      <p>We're thrilled to have you onboard our transparent and reliable bus ticket booking platform. 🎉</p>
      <p>With our system, you can:</p>
      <ul>
        <li>✅ Book intercity bus tickets easily</li>
        <li>✅ View clear cancellation and refund policies</li>
        <li>✅ Track your refund status in real-time</li>
        <li>✅ Access complete transparency in all transactions</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
        Go to Dashboard
      </a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2026 L² Bus Ticket System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Ticket booking confirmation
export const ticketConfirmationTemplate = (data: {
  userName: string;
  bookingId: string;
  route: string;
  date: string;
  seatNumber: string;
  amount: number;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎫 Booking Confirmed!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>Your bus ticket has been successfully booked. Here are your booking details:</p>
      <div class="ticket-info">
        <div class="info-row">
          <strong>Booking ID:</strong>
          <span>${data.bookingId}</span>
        </div>
        <div class="info-row">
          <strong>Route:</strong>
          <span>${data.route}</span>
        </div>
        <div class="info-row">
          <strong>Travel Date:</strong>
          <span>${data.date}</span>
        </div>
        <div class="info-row">
          <strong>Seat Number:</strong>
          <span>${data.seatNumber}</span>
        </div>
        <div class="info-row">
          <strong>Amount Paid:</strong>
          <span>₹${data.amount}</span>
        </div>
      </div>
      <p><strong>Important:</strong> Please arrive at the boarding point 15 minutes before departure.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// Cancellation confirmation email
export const cancellationConfirmationTemplate = (data: {
  userName: string;
  bookingId: string;
  cancellationId: string;
  route: string;
  refundAmount: number;
  cancellationFee: number;
  originalAmount: number;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .refund-breakdown { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .total-row { font-weight: bold; font-size: 18px; color: #10b981; padding-top: 15px; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 Cancellation Confirmed</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>Your ticket cancellation request has been processed successfully.</p>
      
      <div class="refund-breakdown">
        <h3>📊 Refund Breakdown</h3>
        <div class="breakdown-row">
          <span>Booking ID:</span>
          <strong>${data.bookingId}</strong>
        </div>
        <div class="breakdown-row">
          <span>Cancellation ID:</span>
          <strong>${data.cancellationId}</strong>
        </div>
        <div class="breakdown-row">
          <span>Route:</span>
          <span>${data.route}</span>
        </div>
        <hr style="margin: 15px 0;">
        <div class="breakdown-row">
          <span>Original Ticket Amount:</span>
          <span>₹${data.originalAmount}</span>
        </div>
        <div class="breakdown-row">
          <span>Cancellation Fee:</span>
          <span style="color: #ef4444;">- ₹${data.cancellationFee}</span>
        </div>
        <div class="breakdown-row total-row">
          <span>Refund Amount:</span>
          <span>₹${data.refundAmount}</span>
        </div>
      </div>
      
      <p>Your refund will be processed within 5-7 business days to your original payment method.</p>
      <p>You can track your refund status in your dashboard.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// Refund processed notification
export const refundProcessedTemplate = (data: {
  userName: string;
  cancellationId: string;
  refundAmount: number;
  transactionId: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .amount { font-size: 32px; font-weight: bold; color: #10b981; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Refund Processed</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>Great news! Your refund has been successfully processed.</p>
      
      <div class="success-box">
        <p style="margin: 0; font-size: 14px; color: #059669;">Refund Amount</p>
        <div class="amount">₹${data.refundAmount}</div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
          Cancellation ID: ${data.cancellationId}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">
          Transaction ID: ${data.transactionId}
        </p>
      </div>
      
      <p>The refund amount has been credited to your original payment method. Please allow 2-3 business days for the amount to reflect in your account.</p>
      <p>Thank you for using our transparent refund system! 🙏</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// Password reset email
export const passwordResetTemplate = (userName: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hi ${userName},</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <a href="${resetLink}" class="button">Reset Password</a>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
      </div>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// Account security alert
export const securityAlertTemplate = (data: {
  userName: string;
  action: string;
  ipAddress: string;
  timestamp: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .alert-box { background: #fee2e2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Security Alert</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>We detected a security-related action on your account:</p>
      
      <div class="alert-box">
        <p><strong>Action:</strong> ${data.action}</p>
        <p><strong>IP Address:</strong> ${data.ipAddress}</p>
        <p><strong>Time:</strong> ${data.timestamp}</p>
      </div>
      
      <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately by changing your password.</p>
      <p>Contact our support team if you need assistance: support@l2busticket.com</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// Helper function to get template by type
export const getEmailTemplate = (
  type: 'welcome' | 'ticket-confirmation' | 'cancellation' | 'refund-processed' | 'password-reset' | 'security-alert',
  data: any
): string => {
  switch (type) {
    case 'welcome':
      return welcomeTemplate(data.userName);
    case 'ticket-confirmation':
      return ticketConfirmationTemplate(data);
    case 'cancellation':
      return cancellationConfirmationTemplate(data);
    case 'refund-processed':
      return refundProcessedTemplate(data);
    case 'password-reset':
      return passwordResetTemplate(data.userName, data.resetLink);
    case 'security-alert':
      return securityAlertTemplate(data);
    default:
      throw new Error(`Unknown template type: ${type}`);
  }
};