import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// 1. Enforce authenticated session on ALL workspace endpoints
router.use(requireAuth);

interface WorkspaceMessage {
  id: string;
  threadId: string;
  sender: string;
  senderId?: string;
  senderRole?: string;
  recipient: string;
  recipientId?: string;
  recipientRole?: string;
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  unread: boolean;
  labels: string[];
  departmentScope?: 'SUPPORT' | 'FINANCE' | 'OPERATIONS' | 'GENERAL';
}

interface WorkspaceFormQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'dropdown' | 'radio' | 'rating';
  options?: string[];
  required: boolean;
}

interface WorkspaceForm {
  formId: string;
  title: string;
  description: string;
  responseCount: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  url: string;
  accessScope: 'PUBLIC' | 'SELLER_ONLY' | 'STAFF_INTERNAL';
  questions: WorkspaceFormQuestion[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceFormSubmission {
  id: string;
  formId: string;
  userId: string;
  submittedBy: string;
  userRole: string;
  responses: Record<string, any>;
  submittedAt: string;
  status: 'RECEIVED' | 'REVIEWED' | 'PROCESSED';
}

// Helper to get or initialize workspace state
function getWorkspaceMessages(): WorkspaceMessage[] {
  const d = db.getDb();
  if (!d.builderConfig) {
    d.builderConfig = {};
  }
  if (!d.builderConfig.workspaceMessages) {
    d.builderConfig.workspaceMessages = [
      {
        id: 'msg-001',
        threadId: 'thread-001',
        sender: 'LUMO Dispatch <dispatch@lumo.co.tz>',
        senderId: 'usr-admin-1',
        senderRole: 'ADMIN',
        recipient: 'customer@lumo.co.tz',
        subject: 'Order #LM-1048-TZ Confirmed - Escrow Secured',
        snippet: 'Your order has been successfully confirmed and secured under LUMO Escrow Protection. Delivery OTP generated.',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        unread: false,
        labels: ['INBOX', 'ORDERS', 'IMPORTANT'],
        departmentScope: 'OPERATIONS'
      },
      {
        id: 'msg-002',
        threadId: 'thread-002',
        sender: 'LUMO Verify <kyc@lumo.co.tz>',
        senderId: 'usr-admin-1',
        senderRole: 'ADMIN',
        recipient: 'vendor@lumo.co.tz',
        subject: 'Vendor KYC Verification Approved & Active',
        snippet: 'Congratulations! Your store verification documents have been reviewed and approved by LUMO Trust & Safety.',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        unread: true,
        labels: ['INBOX', 'SELLER', 'VERIFIED'],
        departmentScope: 'SUPPORT'
      },
      {
        id: 'msg-003',
        threadId: 'thread-003',
        sender: 'LUMO Finance <payouts@lumo.co.tz>',
        senderId: 'usr-admin-1',
        senderRole: 'ADMIN',
        recipient: 'vendor@lumo.co.tz',
        subject: 'Payment Release Notice: TZS 485,000 Credited to Wallet',
        snippet: 'Payment released following verified customer delivery and OTP receipt confirmation for Order #LM-1032-TZ.',
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        unread: false,
        labels: ['INBOX', 'FINANCE', 'PAYOUTS'],
        departmentScope: 'FINANCE'
      }
    ];
  }
  return d.builderConfig.workspaceMessages;
}

function getWorkspaceForms(): WorkspaceForm[] {
  const d = db.getDb();
  if (!d.builderConfig) {
    d.builderConfig = {};
  }
  if (!d.builderConfig.workspaceForms) {
    d.builderConfig.workspaceForms = [
      {
        formId: 'form-seller-kyc-01',
        title: 'LUMO Vendor KYC & Compliance Verification Form',
        description: 'Mandatory onboarding questionnaire for merchants operating in Tanzania commercial hubs.',
        responseCount: 142,
        status: 'ACTIVE',
        url: 'https://forms.google.com/lumo/vendor-kyc',
        accessScope: 'SELLER_ONLY',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        questions: [
          { id: 'q1', question: 'Legal Business Name', type: 'text', required: true },
          { id: 'q2', question: 'Tanzania TIN / Business Registration Number', type: 'text', required: true },
          { id: 'q3', question: 'Primary Product Category', type: 'dropdown', options: ['Electronics', 'Fashion', 'Groceries', 'Agriculture'], required: true },
          { id: 'q4', question: 'Store Physical Address & City', type: 'textarea', required: true }
        ]
      },
      {
        formId: 'form-customer-satisfaction-02',
        title: 'LUMO Customer Delivery Experience & OTP Survey',
        description: 'Feedback collection on last-mile delivery, rider professionalism, and OTP verification speed.',
        responseCount: 893,
        status: 'ACTIVE',
        url: 'https://forms.google.com/lumo/customer-delivery-feedback',
        accessScope: 'PUBLIC',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        questions: [
          { id: 'q1', question: 'How satisfied were you with your delivery speed?', type: 'rating', required: true },
          { id: 'q2', question: 'Did the rider request and verify your delivery OTP correctly?', type: 'radio', options: ['Yes, perfectly', 'Minor delay', 'No'], required: true },
          { id: 'q3', question: 'Additional comments or feedback', type: 'textarea', required: false }
        ]
      },
      {
        formId: 'form-internal-staff-audit-03',
        title: 'LUMO Internal Operations & Security Compliance Audit',
        description: 'Internal operational review questionnaire restricted to staff and platform administrators.',
        responseCount: 24,
        status: 'ACTIVE',
        url: 'https://forms.google.com/lumo/internal-audit',
        accessScope: 'STAFF_INTERNAL',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        questions: [
          { id: 'q1', question: 'Audit Department Scope', type: 'dropdown', options: ['Warehousing', 'Finance', 'Logistics', 'Security'], required: true },
          { id: 'q2', question: 'Findings & Risk Assessment', type: 'textarea', required: true }
        ]
      }
    ];
  }
  return d.builderConfig.workspaceForms;
}

function getWorkspaceSubmissions(): WorkspaceFormSubmission[] {
  const d = db.getDb();
  if (!d.builderConfig) {
    d.builderConfig = {};
  }
  if (!d.builderConfig.workspaceFormSubmissions) {
    d.builderConfig.workspaceFormSubmissions = [];
  }
  return d.builderConfig.workspaceFormSubmissions;
}

// Staff roles permitted full workspace administrative oversight
const STAFF_ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'SUPPORT_AGENT',
  'COMMUNICATIONS_ADMIN',
  'OPERATIONS_ADMIN'
];

// ==========================================
// 1. GMAIL / WORKSPACE MESSAGE ENDPOINTS
// ==========================================

/**
 * GET /api/workspace/gmail/messages
 * Retrieves messages scoped by authenticated user's role and identity.
 * Prevents IDOR and unauthorized leakage of staff/customer messages.
 */
router.get('/gmail/messages', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allMessages = getWorkspaceMessages();

  // Super Admin and Admin can view all messages
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || (user.role as string) === 'COMMUNICATIONS_ADMIN') {
    return res.json({ success: true, messages: allMessages, total: allMessages.length });
  }

  // Department-specific staff (Support, Finance, Operations)
  if (STAFF_ADMIN_ROLES.includes(user.role)) {
    const staffMessages = allMessages.filter(msg => {
      if (msg.recipient === user.email || msg.recipientId === user.id || msg.senderId === user.id) return true;
      if (user.role === 'SUPPORT_AGENT' && msg.departmentScope === 'SUPPORT') return true;
      if (user.role === 'OPERATIONS_ADMIN' && (msg.departmentScope === 'OPERATIONS' || msg.departmentScope === 'SUPPORT')) return true;
      return false;
    });
    return res.json({ success: true, messages: staffMessages, total: staffMessages.length });
  }

  // Regular users (Customer, Seller, Rider): ONLY messages where they are recipient or sender
  const userMessages = allMessages.filter(msg => 
    msg.recipient === user.email || 
    msg.recipientId === user.id || 
    msg.senderId === user.id
  );

  res.json({ success: true, messages: userMessages, total: userMessages.length });
});

/**
 * GET /api/workspace/gmail/messages/:id
 * Retrieves a single message by ID with strict IDOR ownership check.
 */
router.get('/gmail/messages/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const allMessages = getWorkspaceMessages();
  const message = allMessages.find(m => m.id === id);

  if (!message) {
    return res.status(404).json({ error: 'Workspace message not found.' });
  }

  // Admin and Communications Admin can access any message
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || (user.role as string) === 'COMMUNICATIONS_ADMIN') {
    return res.json({ success: true, message });
  }

  // Check IDOR ownership
  const isOwner = message.recipient === user.email || message.recipientId === user.id || message.senderId === user.id;
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden. You do not have permission to view this message.' });
  }

  res.json({ success: true, message });
});

/**
 * POST /api/workspace/gmail/send
 * Sends an email message via Workspace/Gmail integration.
 * Enforces RBAC: Only authorized verified staff or verified sellers communicating on support/orders.
 * Authoritative sender binding: Never trust client-supplied sender/from/userId.
 */
router.post('/gmail/send', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { recipient, subject, body, departmentScope } = req.body;

  if (!recipient || !subject || !body) {
    return res.status(400).json({ error: 'Recipient, subject, and body are required for Gmail transmission.' });
  }

  // Check verification & authorization: Unverified staff/sellers or unauthorized roles cannot send
  const isStaff = STAFF_ADMIN_ROLES.includes(user.role);
  const isSeller = user.role === 'SELLER';

  if (!isStaff && !isSeller) {
    return res.status(403).json({ 
      error: `Forbidden. Role '${user.role}' is not authorized to transmit emails via Workspace/Gmail API.` 
    });
  }

  // Unverified staff or sellers must be blocked
  if (user.role !== 'SUPER_ADMIN' && user.isVerified === false) {
    return res.status(403).json({ 
      error: 'Account verification required. Verified account status is required to dispatch emails.' 
    });
  }

  // Authoritative sender generation (preventing email/identity spoofing)
  const authoritativeSender = isStaff 
    ? `${user.name} <${user.email}>` 
    : `${user.name} (Seller) <${user.email}>`;

  const newMessage: WorkspaceMessage = {
    id: `msg-${Date.now()}`,
    threadId: `thread-${Date.now()}`,
    sender: authoritativeSender,
    senderId: user.id,
    senderRole: user.role,
    recipient: recipient.trim().toLowerCase(),
    subject: subject.trim(),
    snippet: body.length > 120 ? `${body.substring(0, 117)}...` : body,
    body: body.trim(),
    date: new Date().toISOString(),
    unread: true,
    labels: ['SENT', isStaff ? 'STAFF' : 'SELLER'],
    departmentScope: departmentScope || (isStaff ? 'SUPPORT' : 'GENERAL')
  };

  db.updateDb(d => {
    if (!d.builderConfig) d.builderConfig = {};
    if (!d.builderConfig.workspaceMessages) d.builderConfig.workspaceMessages = getWorkspaceMessages();
    d.builderConfig.workspaceMessages.unshift(newMessage);
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'GMAIL_MESSAGE_SENT',
    entityType: 'SUPPORT',
    entityId: newMessage.id,
    previousValue: 'DRAFT',
    newValue: `Sent email via Gmail API to ${recipient}: "${subject}"`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    messageId: newMessage.id,
    status: 'SENT',
    sender: authoritativeSender,
    recipient,
    subject,
    timestamp: newMessage.date
  });
});

/**
 * DELETE /api/workspace/gmail/messages/:id
 * Deletes a message. Restricted to Admin or message author.
 */
router.delete('/gmail/messages/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const messages = getWorkspaceMessages();
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  const message = messages[index];
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const isAuthor = message.senderId === user.id;

  if (!isAdmin && !isAuthor) {
    return res.status(403).json({ error: 'Forbidden. You do not have permission to delete this message.' });
  }

  db.updateDb(d => {
    if (d.builderConfig && Array.isArray(d.builderConfig.workspaceMessages)) {
      d.builderConfig.workspaceMessages = d.builderConfig.workspaceMessages.filter((m: WorkspaceMessage) => m.id !== id);
    }
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'GMAIL_MESSAGE_DELETED',
    entityType: 'SUPPORT',
    entityId: id,
    newValue: `Deleted workspace message ${id}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, message: 'Message successfully deleted.' });
});

// ==========================================
// 2. GOOGLE FORMS / WORKSPACE FORMS ENDPOINTS
// ==========================================

/**
 * GET /api/workspace/forms
 * Lists forms filtered by role access permissions.
 * Internal admin forms are never leaked to regular customers or unauthorized roles.
 */
router.get('/forms', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allForms = getWorkspaceForms();

  // Super Admin, Admin, and Operations Admin can view all forms
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OPERATIONS_ADMIN') {
    return res.json({ success: true, forms: allForms, total: allForms.length });
  }

  // Sellers can view PUBLIC and SELLER_ONLY forms
  if (user.role === 'SELLER') {
    const sellerForms = allForms.filter(f => f.status === 'ACTIVE' && (f.accessScope === 'PUBLIC' || f.accessScope === 'SELLER_ONLY'));
    return res.json({ success: true, forms: sellerForms, total: sellerForms.length });
  }

  // Other roles (CUSTOMER, RIDER) can only view PUBLIC active forms
  const publicForms = allForms.filter(f => f.status === 'ACTIVE' && f.accessScope === 'PUBLIC');
  res.json({ success: true, forms: publicForms, total: publicForms.length });
});

/**
 * GET /api/workspace/forms/:formId
 * Retrieves a specific form definition. Enforces scope authorization.
 */
router.get('/forms/:formId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { formId } = req.params;
  const allForms = getWorkspaceForms();
  const form = allForms.find(f => f.formId === formId);

  if (!form) {
    return res.status(404).json({ error: 'Form not found.' });
  }

  // Check access permissions
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OPERATIONS_ADMIN';
  if (!isAdmin) {
    if (form.accessScope === 'STAFF_INTERNAL') {
      return res.status(403).json({ error: 'Forbidden. This form is restricted to internal staff.' });
    }
    if (form.accessScope === 'SELLER_ONLY' && user.role !== 'SELLER') {
      return res.status(403).json({ error: 'Forbidden. This form is restricted to registered sellers.' });
    }
  }

  res.json({ success: true, form });
});

/**
 * POST /api/workspace/forms
 * Creates a new workspace form. Restricted to administrators.
 */
router.post('/forms', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { title, description, url, accessScope, questions } = req.body;

  if (!title || !description || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title, description, and questions array are required.' });
  }

  const newForm: WorkspaceForm = {
    formId: `form-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    responseCount: 0,
    status: 'ACTIVE',
    url: url || `https://forms.google.com/lumo/${Date.now()}`,
    accessScope: accessScope || 'PUBLIC',
    questions,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!d.builderConfig) d.builderConfig = {};
    if (!d.builderConfig.workspaceForms) d.builderConfig.workspaceForms = getWorkspaceForms();
    d.builderConfig.workspaceForms.push(newForm);
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'WORKSPACE_FORM_CREATED',
    entityType: 'SETTINGS',
    entityId: newForm.formId,
    newValue: `Created form "${newForm.title}" with scope ${newForm.accessScope}`
  });

  res.status(201).json({ success: true, form: newForm });
});

/**
 * PUT /api/workspace/forms/:formId
 * Updates form details or status. Restricted to administrators.
 */
router.put('/forms/:formId', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { formId } = req.params;
  const forms = getWorkspaceForms();
  const form = forms.find(f => f.formId === formId);

  if (!form) {
    return res.status(404).json({ error: 'Form not found.' });
  }

  const { title, description, status, accessScope, questions } = req.body;

  db.updateDb(d => {
    const target = d.builderConfig?.workspaceForms?.find((f: WorkspaceForm) => f.formId === formId);
    if (target) {
      if (title) target.title = title.trim();
      if (description) target.description = description.trim();
      if (status) target.status = status;
      if (accessScope) target.accessScope = accessScope;
      if (Array.isArray(questions)) target.questions = questions;
      target.updatedAt = new Date().toISOString();
    }
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'WORKSPACE_FORM_UPDATED',
    entityType: 'SETTINGS',
    entityId: formId,
    newValue: `Updated form ${formId}`
  });

  res.json({ success: true, message: 'Form successfully updated.' });
});

/**
 * DELETE /api/workspace/forms/:formId
 * Deletes a workspace form. Restricted to Super Admin and Admin.
 */
router.delete('/forms/:formId', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { formId } = req.params;
  const forms = getWorkspaceForms();
  const form = forms.find(f => f.formId === formId);

  if (!form) {
    return res.status(404).json({ error: 'Form not found.' });
  }

  db.updateDb(d => {
    if (d.builderConfig?.workspaceForms) {
      d.builderConfig.workspaceForms = d.builderConfig.workspaceForms.filter((f: WorkspaceForm) => f.formId !== formId);
    }
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'WORKSPACE_FORM_DELETED',
    entityType: 'SETTINGS',
    entityId: formId,
    newValue: `Deleted form ${formId} ("${form.title}")`
  });

  res.json({ success: true, message: 'Form successfully deleted.' });
});

/**
 * POST /api/workspace/forms/submit and POST /api/workspace/forms/:formId/submit
 * Submits a form response.
 * Strictly binds submitter identity to req.user (ignoring client-supplied spoofed fields).
 * Verifies form access permissions and active status.
 */
function handleFormSubmission(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const formId = req.params.formId || req.body.formId;
  const responses = req.body.responses || req.body.formData || req.body;

  if (!formId) {
    return res.status(400).json({ error: 'Form ID is required.' });
  }

  if (!responses || typeof responses !== 'object') {
    return res.status(400).json({ error: 'Responses payload is required.' });
  }

  const allForms = getWorkspaceForms();
  const form = allForms.find(f => f.formId === formId);

  if (!form) {
    return res.status(404).json({ error: 'Form not found.' });
  }

  if (form.status !== 'ACTIVE') {
    return res.status(400).json({ error: 'This form is no longer accepting responses.' });
  }

  // Access check
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OPERATIONS_ADMIN';
  if (!isAdmin) {
    if (form.accessScope === 'STAFF_INTERNAL') {
      return res.status(403).json({ error: 'Forbidden. This form is restricted to internal staff members.' });
    }
    if (form.accessScope === 'SELLER_ONLY' && user.role !== 'SELLER') {
      return res.status(403).json({ error: 'Forbidden. This form is restricted to registered sellers.' });
    }
  }

  // Authoritative submission record
  const submission: WorkspaceFormSubmission = {
    id: `sub-${Date.now()}`,
    formId,
    userId: user.id,
    submittedBy: user.email,
    userRole: user.role,
    responses,
    submittedAt: new Date().toISOString(),
    status: 'RECEIVED'
  };

  db.updateDb(d => {
    if (!d.builderConfig) d.builderConfig = {};
    if (!d.builderConfig.workspaceFormSubmissions) {
      d.builderConfig.workspaceFormSubmissions = getWorkspaceSubmissions();
    }
    d.builderConfig.workspaceFormSubmissions.unshift(submission);

    // Increment response count
    const targetForm = d.builderConfig.workspaceForms?.find((f: WorkspaceForm) => f.formId === formId);
    if (targetForm) {
      targetForm.responseCount = (targetForm.responseCount || 0) + 1;
    }
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'GOOGLE_FORM_SUBMITTED',
    entityType: 'KYC',
    entityId: formId,
    previousValue: 'PENDING',
    newValue: `Recorded submission for form "${form.title}" (ID: ${formId})`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    submissionId: submission.id,
    formId,
    status: 'ACCEPTED',
    message: 'Google Forms response successfully recorded and synced to LUMO analytics database.'
  });
}

router.post('/forms/submit', handleFormSubmission);
router.post('/forms/:formId/submit', handleFormSubmission);

/**
 * GET /api/workspace/forms/:formId/submissions
 * Retrieves submissions for a form.
 * RBAC & IDOR Protection:
 * - Administrators can view all submissions.
 * - Regular users can ONLY view their own submission records.
 */
router.get('/forms/:formId/submissions', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { formId } = req.params;
  const submissions = getWorkspaceSubmissions();
  const formSubmissions = submissions.filter(s => s.formId === formId);

  // Administrators view all submissions
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OPERATIONS_ADMIN' || user.role === 'SUPPORT_AGENT';
  if (isAdmin) {
    return res.json({ success: true, submissions: formSubmissions, total: formSubmissions.length });
  }

  // Regular users only see their own submissions (IDOR prevention)
  const ownSubmissions = formSubmissions.filter(s => s.userId === user.id || s.submittedBy === user.email);
  res.json({ success: true, submissions: ownSubmissions, total: ownSubmissions.length });
});

/**
 * GET /api/workspace/forms/submissions/:submissionId
 * Retrieves a single submission by ID with strict IDOR protection.
 */
router.get('/forms/submissions/:submissionId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { submissionId } = req.params;
  const submissions = getWorkspaceSubmissions();
  const submission = submissions.find(s => s.id === submissionId);

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OPERATIONS_ADMIN' || user.role === 'SUPPORT_AGENT';
  const isOwner = submission.userId === user.id || submission.submittedBy === user.email;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Forbidden. You do not have permission to access this submission.' });
  }

  res.json({ success: true, submission });
});

/**
 * DELETE /api/workspace/forms/submissions/:submissionId
 * Deletes a submission. Restricted to Admin or owner.
 */
router.delete('/forms/submissions/:submissionId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { submissionId } = req.params;
  const submissions = getWorkspaceSubmissions();
  const submission = submissions.find(s => s.id === submissionId);

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const isOwner = submission.userId === user.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Forbidden. You do not have permission to delete this submission.' });
  }

  db.updateDb(d => {
    if (d.builderConfig?.workspaceFormSubmissions) {
      d.builderConfig.workspaceFormSubmissions = d.builderConfig.workspaceFormSubmissions.filter((s: WorkspaceFormSubmission) => s.id !== submissionId);
    }
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'WORKSPACE_SUBMISSION_DELETED',
    entityType: 'SETTINGS',
    entityId: submissionId,
    newValue: `Deleted form submission ${submissionId}`
  });

  res.json({ success: true, message: 'Submission successfully deleted.' });
});

export default router;

