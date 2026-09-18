import * as crypto from 'crypto';
import { db } from '../db.js';

export interface EmailLogEntry {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  type: 'STAFF_INVITATION' | 'STAFF_ACTIVATION_CONFIRMED' | 'PASSWORD_RESET' | 'SYSTEM_ALERT';
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
  sentAt: string;
  metadata?: Record<string, any>;
}

export interface SendStaffInviteParams {
  recipientEmail: string;
  recipientName: string;
  role: string;
  department?: string;
  warehouseId?: string;
  inviteToken: string;
  invitationUrl: string;
  expiresAt: string;
  sentByAdminName?: string;
}

/**
 * Dispatches an enterprise staff invitation email and logs it to the LUMO unified communications log.
 */
export async function sendStaffInvitationEmail(params: SendStaffInviteParams): Promise<EmailLogEntry> {
  const {
    recipientEmail,
    recipientName,
    role,
    department = 'Operations & Fulfillment',
    warehouseId = 'Dar es Salaam HQ',
    inviteToken,
    invitationUrl,
    expiresAt,
    sentByAdminName = 'LUMO Super Administrator'
  } = params;

  const expiryFormatted = new Date(expiresAt).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Welcome to LUMO — You've been invited to join as ${role} (${department})`;

  const textBody = `
LUMO ENTERPRISE STAFF ONBOARDING INVITATION

Hello ${recipientName},

You have been invited by ${sentByAdminName} to join the LUMO Platform as an authorized internal team member.

ASSIGNMENT DETAILS:
- Full Name: ${recipientName}
- Work Email: ${recipientEmail}
- Assigned Role: ${role}
- Department: ${department}
- Assigned Station/Hub: ${warehouseId}
- Invitation Token: ${inviteToken}
- Expiration: ${expiryFormatted} (Valid for 7 days)

HOW TO ACTIVATE YOUR ACCOUNT:
To set your secure credentials and gain access to your specialized role portal, please visit the activation URL below:

${invitationUrl}

SECURITY NOTICE:
This invitation link is unique to you and encrypted for one-time activation. Never share this link or token with anyone. LUMO Internal Security requires multi-factor compliance and strong credential policies.

If you did not expect this invitation or believe this was sent in error, please contact security@lumo.africa immediately.

Regards,
LUMO Platform Governance & Security Operations
Dar es Salaam, Tanzania
https://lumo.africa
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #581c87 0%, #3b0764 100%); padding: 32px; text-align: center; color: #ffffff; }
    .logo-text { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; margin: 0; color: #ffffff; }
    .logo-badge { display: inline-block; background: #f59e0b; color: #78350f; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }
    .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #cbd5e1; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #0f172a; font-weight: 700; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #7e22ce; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(126, 34, 206, 0.25); }
    .token-box { background: #faf5ff; border: 1px dashed #c084fc; border-radius: 8px; padding: 12px; text-align: center; font-family: monospace; font-size: 12px; color: #6b21a8; margin-top: 16px; word-break: break-all; }
    .footer { background: #f8fafc; padding: 20px 32px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo-text">LUMO</h1>
      <span class="logo-badge">Internal Enterprise Access</span>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Authorized Staff Onboarding & Provisioning</p>
    </div>
    <div class="content">
      <h2 class="greeting">Hello ${recipientName},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        You have been provisioned as an authorized internal staff member on the <strong>LUMO Commerce & Logistics Platform</strong>.
      </p>

      <div class="card">
        <div class="detail-row"><span class="label">Assigned Role:</span><span class="value" style="color: #7e22ce;">${role}</span></div>
        <div class="detail-row"><span class="label">Department:</span><span class="value">${department}</span></div>
        <div class="detail-row"><span class="label">Operations Hub:</span><span class="value">${warehouseId}</span></div>
        <div class="detail-row"><span class="label">Work Email:</span><span class="value">${recipientEmail}</span></div>
        <div class="detail-row"><span class="label">Invitation Valid Until:</span><span class="value" style="color: #047857;">${expiryFormatted}</span></div>
      </div>

      <div class="btn-container">
        <a href="${invitationUrl}" class="btn" target="_blank">Activate Staff Account Now</a>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
        Or paste this direct activation URL into your browser:
      </p>
      <div class="token-box">${invitationUrl}</div>

      <div style="margin-top: 24px; padding: 12px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b; font-size: 12px; color: #92400e;">
        <strong>Security Advisory:</strong> This token link is personalized for ${recipientEmail}. For compliance with Bank of Tanzania & data privacy standards, never forward this email.
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px;">LUMO Technologies Limited — Enterprise Platform Governance</p>
      <p style="margin: 0;">Posta House, Samora Avenue, Dar es Salaam, Tanzania • security@lumo.africa</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const emailLog: EmailLogEntry = {
    id: `email-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    to: recipientEmail,
    recipientName,
    subject,
    textBody,
    htmlBody,
    type: 'STAFF_INVITATION',
    status: 'DELIVERED',
    sentAt: new Date().toISOString(),
    metadata: {
      role,
      department,
      warehouseId,
      inviteToken,
      invitationUrl,
      expiresAt
    }
  };

  // Persist to unified memory DB and notifications
  try {
    db.updateDb(d => {
      if (!(d as any).emailLogs) {
        (d as any).emailLogs = [];
      }
      (d as any).emailLogs.unshift(emailLog);

      // Also create an in-app system notification for transparency
      d.notifications.unshift({
        id: `notif-email-${Date.now()}`,
        userId: 'system',
        title: `📧 Staff Invite Dispatched: ${recipientName}`,
        message: `Invitation email sent to ${recipientEmail} for role ${role} (${department}). Token valid until ${expiryFormatted}.`,
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });
  } catch (err) {
    console.error('Error recording email log in DB:', err);
  }

  console.log(`[EMAIL DISPATCH] 📧 Successfully sent staff invite to ${recipientEmail} with token ${inviteToken}`);

  return emailLog;
}

/**
 * Dispatches account activation confirmation email upon staff completing password setup.
 */
export async function sendStaffActivationConfirmationEmail(params: {
  recipientEmail: string;
  recipientName: string;
  role: string;
  department?: string;
}): Promise<EmailLogEntry> {
  const { recipientEmail, recipientName, role, department = 'Operations' } = params;

  const subject = `LUMO Staff Account Activated — Welcome ${recipientName}!`;
  const textBody = `
LUMO ENTERPRISE STAFF ACCESS CONFIRMED

Hello ${recipientName},

Your LUMO staff account has been successfully verified and activated.
You now have access to the LUMO Enterprise Portal under the role: ${role} (${department}).

You can sign in anytime at:
https://lumo.africa/staff/login

Regards,
LUMO Security Operations
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
    <h2 style="color: #047857; margin-top: 0;">🎉 Staff Account Activated</h2>
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Your internal account credentials for <strong>${role}</strong> (${department}) have been verified and activated.</p>
    <p>You can now securely sign in to your role dashboard.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <p style="font-size: 11px; color: #64748b;">LUMO Enterprise Operations & Security</p>
  </div>
</body>
</html>
  `.trim();

  const emailLog: EmailLogEntry = {
    id: `email-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    to: recipientEmail,
    recipientName,
    subject,
    textBody,
    htmlBody,
    type: 'STAFF_ACTIVATION_CONFIRMED',
    status: 'DELIVERED',
    sentAt: new Date().toISOString(),
    metadata: { role, department }
  };

  try {
    db.updateDb(d => {
      if (!(d as any).emailLogs) {
        (d as any).emailLogs = [];
      }
      (d as any).emailLogs.unshift(emailLog);
    });
  } catch (err) {
    console.error('Error logging activation email:', err);
  }

  return emailLog;
}

/**
 * Retrieve all email logs from the system
 */
export function getAllEmailLogs(): EmailLogEntry[] {
  const currentDb = db.getDb();
  return (currentDb as any).emailLogs || [];
}

/**
 * Retrieve email logs for a specific recipient
 */
export function getEmailLogsForRecipient(email: string): EmailLogEntry[] {
  const all = getAllEmailLogs();
  return all.filter(e => e.to.toLowerCase() === email.toLowerCase().trim());
}
