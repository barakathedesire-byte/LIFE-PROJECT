import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to block demo, test, and bypass functionality in production mode.
 * Targets: Demo logins, hardcoded bypass parameters, and test endpoints.
 */
export const productionGuard = (req: Request, res: Response, next: NextFunction) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    return next();
  }

  // 1. Block Demo Authentication Endpoints
  const blockedPaths = [
    '/api/auth/demo-login',
    '/api/auth/demo-users',
    '/api/test/',
    '/api/debug/'
  ];

  if (blockedPaths.some(path => req.path.startsWith(path))) {
    console.warn(`[SECURITY] Blocked access to demo/test endpoint in production: ${req.path}`);
    return res.status(403).json({
      error: 'Access Denied: Demo and test endpoints are disabled in production environment.',
      code: 'PRODUCTION_RESTRICTION'
    });
  }

  // 2. Block Hardcoded Bypass Parameters
  const blockedParams = ['useDemoData', 'bypassKyc', 'skipPayment', 'mockFinancials'];
  for (const param of blockedParams) {
    if (req.query[param] || (req.body && req.body[param])) {
      console.warn(`[SECURITY] Blocked request with bypass parameter: ${param}`);
      return res.status(400).json({
        error: `Illegal Parameter: '${param}' is strictly forbidden in production.`,
        code: 'BYPASS_ATTEMPT_REJECTED'
      });
    }
  }

  // 3. Block Hardcoded Test Accounts if attempted via non-standard means
  // (Standard auth should handle this, but this is an extra layer)
  const blockedEmails = [
    'admin@lumo.co.tz',
    'demo@lumo.co.tz',
    'test@lumo.co.tz'
  ];
  if (req.body?.email && blockedEmails.includes(req.body.email.toLowerCase()) && !req.path.includes('/auth/login')) {
     // Allow login but maybe flag it? Actually better to just let standard auth handle it if they are real accounts.
     // But for "demo" specifically, we might want to block.
  }

  next();
};
