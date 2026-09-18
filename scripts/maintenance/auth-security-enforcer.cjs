/**
 * LUMO Enterprise - Auth & Security Enforcement Utility
 * Consolidated maintenance script for verifying authentication middleware,
 * user role restrictions, operational account provisioning, and KYC verification guards.
 */

const fs = require('fs');
const path = require('path');

function enforceRouteVerification(filePath, routeConfigs) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] Target route file not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Ensure requireVerified is imported if requireAuth is present
  if (content.includes('requireAuth') && !content.includes('requireVerified')) {
    content = content.replace(/requireAuth([, }]+)/, 'requireAuth, requireVerified$1');
    modified = true;
  }

  for (const config of routeConfigs) {
    if (config.from.test(content)) {
      content = content.replace(config.from, config.to);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[AUTH-ENFORCE] Updated route security in ${filePath}`);
  } else {
    console.log(`[AUTH-ENFORCE] Route security up-to-date in ${filePath}`);
  }
}

// Verification checks across sensitive operational routes
enforceRouteVerification('server/routes/orders.ts', [
  { from: /router\.patch\('\/:id\/status',\s*\(req: AuthenticatedRequest/g, to: "router.patch('/:id/status', requireVerified, (req: AuthenticatedRequest" },
  { from: /router\.put\('\/:id',\s*handleOrderUpdate/g, to: "router.put('/:id', requireVerified, handleOrderUpdate" },
  { from: /router\.patch\('\/:id',\s*handleOrderUpdate/g, to: "router.patch('/:id', requireVerified, handleOrderUpdate" },
  { from: /router\.delete\('\/:id',\s*\(req: AuthenticatedRequest/g, to: "router.delete('/:id', requireVerified, (req: AuthenticatedRequest" },
  { from: /router\.patch\('\/disputes\/:id',\s*\(req: AuthenticatedRequest/g, to: "router.patch('/disputes/:id', requireVerified, (req: AuthenticatedRequest" }
]);

enforceRouteVerification('server/routes/products.ts', [
  { from: /router\.post\('\/',\s*requireRole\('SUPER_ADMIN',\s*'ADMIN',\s*'CATALOG_ADMIN',\s*'SELLER'\),\s*\(req/g, to: "router.post('/', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req" },
  { from: /router\.put\('\/:id',\s*requireRole\('SUPER_ADMIN',\s*'ADMIN',\s*'CATALOG_ADMIN',\s*'SELLER'\),\s*\(req/g, to: "router.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req" },
  { from: /router\.delete\('\/:id',\s*requireRole\('SUPER_ADMIN',\s*'ADMIN',\s*'CATALOG_ADMIN',\s*'SELLER'\),\s*\(req/g, to: "router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req" },
  { from: /router\.post\('\/:id\/adjust-stock',\s*requireRole\([^)]+\),\s*\(req/g, to: "router.post('/:id/adjust-stock', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req" }
]);

console.log('[AUTH-ENFORCE] Security validation complete.');
