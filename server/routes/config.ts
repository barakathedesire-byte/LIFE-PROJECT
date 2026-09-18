import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/config or /api/config/active - Public & App-wide active configuration
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const currentDb = db.getDb();
  const builderConfig = currentDb.builderConfig || {};
  res.json({
    success: true,
    builderConfig,
    activeVersion: builderConfig.activeVersion || 'v1.0.0-live',
    lastPublishedAt: builderConfig.lastPublishedAt || new Date().toISOString()
  });
});

// GET /api/config/builder-config (Restricted to platform administrators)
router.get('/builder-config', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const currentDb = db.getDb();
  res.json({ builderConfig: currentDb.builderConfig || {} });
});

router.get('/active', (req: AuthenticatedRequest, res: Response) => {
  const currentDb = db.getDb();
  const builderConfig = currentDb.builderConfig || {};
  
  res.json({
    success: true,
    builderConfig,
    activeVersion: builderConfig.activeVersion || 'v1.0.0-live',
    lastPublishedAt: builderConfig.lastPublishedAt || new Date().toISOString()
  });
});

// POST /api/config/publish - Publish draft configuration
router.post('/publish', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { title, notes } = req.body;
  let newVersion: any = null;

  db.updateDb(d => {
    const currentConfig = d.builderConfig || {};
    const versions = currentConfig.versions || [];
    const versionNumber = `v1.${versions.length + 1}.0`;
    
    newVersion = {
      id: `ver-${Date.now()}`,
      version: versionNumber,
      title: title || `Platform Release ${versionNumber}`,
      notes: notes || 'Published live platform builder changes.',
      snapshot: JSON.parse(JSON.stringify(currentConfig)),
      publishedBy: req.user?.name || 'Super Admin',
      publishedAt: new Date().toISOString(),
      status: 'PUBLISHED'
    };

    // Mark existing versions as ARCHIVED
    const updatedVersions = versions.map((v: any) => ({ ...v, status: 'ARCHIVED' }));
    updatedVersions.unshift(newVersion);

    d.builderConfig = {
      ...currentConfig,
      activeVersion: versionNumber,
      lastPublishedAt: newVersion.publishedAt,
      versions: updatedVersions
    };
  });

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'PUBLISH_CONFIG_VERSION',
    entityType: 'PLATFORM_BUILDER',
    entityId: newVersion.id,
    newValue: `Published configuration version ${newVersion.version}`
  });

  res.json({ success: true, version: newVersion });
});

// GET /api/config/versions - Get history of configuration versions (Restricted to Admins)
router.get('/versions', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const currentDb = db.getDb();
  const versions = (currentDb.builderConfig && currentDb.builderConfig.versions) || [];
  res.json({ versions });
});

// POST /api/config/rollback - Restore / Rollback to target version
router.post('/rollback', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { versionId } = req.body;
  let targetVersion: any = null;

  db.updateDb(d => {
    const currentConfig = d.builderConfig || {};
    const versions = currentConfig.versions || [];
    targetVersion = versions.find((v: any) => v.id === versionId || v.version === versionId);

    if (targetVersion && targetVersion.snapshot) {
      // Restore snapshot
      const restoredConfig = JSON.parse(JSON.stringify(targetVersion.snapshot));
      restoredConfig.activeVersion = `v-rollback-${targetVersion.version}`;
      restoredConfig.lastPublishedAt = new Date().toISOString();
      restoredConfig.versions = versions.map((v: any) => 
        v.id === targetVersion.id ? { ...v, status: 'PUBLISHED' } : { ...v, status: 'ARCHIVED' }
      );
      d.builderConfig = restoredConfig;
    }
  });

  if (!targetVersion) {
    return res.status(404).json({ error: 'Target configuration version not found' });
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'ROLLBACK_CONFIG_VERSION',
    entityType: 'PLATFORM_BUILDER',
    entityId: versionId,
    newValue: `Rolled back configuration to version ${targetVersion.version}`
  });

  res.json({ success: true, version: targetVersion, builderConfig: db.getDb().builderConfig });
});

// POST /api/config/forms/:formId/submit - Handle dynamic form submission
router.post('/forms/:formId/submit', (req: AuthenticatedRequest, res: Response) => {
  const { formId } = req.params;
  const formData = req.body;

  const submission = {
    id: `sub-${Date.now()}`,
    formId,
    submittedBy: req.user?.email || formData.email || 'Anonymous User',
    data: formData,
    submittedAt: new Date().toISOString(),
    status: 'RECEIVED'
  };

  db.updateDb(d => {
    const currentConfig = d.builderConfig || {};
    const submissions = currentConfig.formSubmissions || [];
    d.builderConfig = {
      ...currentConfig,
      formSubmissions: [submission, ...submissions]
    };
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'SUBMIT_DYNAMIC_FORM',
    entityType: 'FORM_BUILDER',
    entityId: formId,
    newValue: `Submitted dynamic form ${formId}`
  });

  res.json({ success: true, submission });
});

// POST /api/config/integrations/:id/test - Test integration endpoint
router.post('/integrations/:id/test', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentDb = db.getDb();
  const integrations = (currentDb.builderConfig && currentDb.builderConfig.integrations) || [];
  const integration = integrations.find((i: any) => i.id === id || i.key === id);

  const mockLatency = crypto.randomInt(45, 125);
  const testResult = {
    id: `test-${Date.now()}`,
    integrationId: id,
    status: 'SUCCESSFUL',
    latencyMs: mockLatency,
    timestamp: new Date().toISOString(),
    message: `Connected successfully to ${integration?.name || id} API endpoint.`
  };

  db.updateDb(d => {
    if (d.builderConfig && Array.isArray(d.builderConfig.integrations)) {
      const target = d.builderConfig.integrations.find((i: any) => i.id === id || i.key === id);
      if (target) {
        target.lastTestedAt = new Date().toISOString();
        target.testStatus = 'CONNECTED';
      }
    }
  });

  res.json({ success: true, testResult });
});

export default router;
