import * as crypto from 'crypto';
import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';

import { generateSecureId } from '../utils/security.js';

const router = Router();

// In-memory message store (Production should persist to DB)
export const sentMessages: any[] = [];

export function sendAutomatedMessage(params: {
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'Push';
  recipient: string;
  subject?: string;
  message: string;
  templateId?: string;
}) {
  const newMessage = {
    id: generateSecureId('msg'),
    channel: params.channel,
    recipient: params.recipient,
    subject: params.subject || 'LUMO Automated Notification',
    message: params.message,
    templateId: params.templateId || 'system-event',
    status: 'SENT',
    timestamp: new Date().toISOString()
  };

  sentMessages.unshift(newMessage);
  console.log(`[LUMO Automation Dispatcher] Sent ${params.channel} to ${params.recipient}: "${params.message.substring(0, 60)}..."`);
  return newMessage;
}

router.get('/', requireRole('SUPER_ADMIN', 'ADMIN'), (req, res) => {
  res.json({ success: true, messages: sentMessages });
});

router.post('/send', requireRole('SUPER_ADMIN', 'ADMIN'), (req, res) => {
  const { channel, recipient, subject, message, templateId } = req.body;
  if (!channel || !recipient || !message) {
    return res.status(400).json({ success: false, error: 'Channel, recipient, and message are required' });
  }

  const newMessage = sendAutomatedMessage({ channel, recipient, subject, message, templateId });
  res.json({ success: true, message: newMessage });
});

router.post('/broadcast', requireRole('SUPER_ADMIN', 'ADMIN'), (req, res) => {
  const { channel, targetGroup, subject, message } = req.body;
  const broadcastMsg = sendAutomatedMessage({
    channel: channel || 'SMS',
    recipient: `Broadcast: ${targetGroup || 'All Active Merchants'}`,
    subject: subject || 'LUMO Platform Advisory',
    message: message || 'Important system update regarding scheduled banking reconciliation.'
  });

  res.json({ success: true, broadcast: broadcastMsg });
});

export default router;
