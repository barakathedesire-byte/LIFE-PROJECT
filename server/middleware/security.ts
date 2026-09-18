import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface SecurityLog {
  id: string;
  timestamp: string;
  ip: string;
  method: string;
  url: string;
  threatType: 'SQL_INJECTION' | 'XSS_ATTACK' | 'COMMAND_INJECTION' | 'PATH_TRAVERSAL' | 'RATE_LIMIT_EXCEEDED' | 'MALICIOUS_BOT';
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionTaken: 'BLOCKED' | 'SANITIZED' | 'RATE_LIMITED';
  details: string;
}

// In-memory security audit store
const securityLogs: SecurityLog[] = [];
const bannedIPs = new Set<string>();
const attackCounters = new Map<string, number>();

// Rate limiting state: IP -> { count, resetTime }
const requestRateMap = new Map<string, { count: number; resetTime: number }>();
const authRateMap = new Map<string, { count: number; resetTime: number }>();

export const getSecurityLogs = () => securityLogs;
export const getBannedIPs = () => Array.from(bannedIPs);
export const unbanIP = (ip: string) => bannedIPs.delete(ip);
export const clearSecurityLogs = () => { securityLogs.length = 0; };

// OWASP Security Headers Middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // X-Frame-Options omitted to allow rendering within AI Studio iframe preview
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  next();
};

// Log a detected security incident
const logIncident = (
  ip: string,
  req: Request,
  threatType: SecurityLog['threatType'],
  severity: SecurityLog['severity'],
  actionTaken: SecurityLog['actionTaken'],
  details: string
) => {
  const incident: SecurityLog = {
    id: 'sec_' + crypto.randomBytes(4).toString("hex"),
    timestamp: new Date().toISOString(),
    ip,
    method: req.method,
    url: req.originalUrl || req.url,
    threatType,
    severity,
    actionTaken,
    details
  };

  securityLogs.unshift(incident);
  if (securityLogs.length > 200) securityLogs.pop(); // Keep last 200 security logs

  // Increment attack count for IP auto-ban
  const currentAttacks = (attackCounters.get(ip) || 0) + 1;
  attackCounters.set(ip, currentAttacks);

  if (currentAttacks >= 5) {
    bannedIPs.add(ip);
    console.warn(`[CYBERSECURITY WAF] IP ${ip} automatically banned due to repeated malicious attack attempts (${currentAttacks} incidents).`);
  }
};

// Malicious Bot & Scanner Inspection
const MALICIOUS_BOT_PATTERNS = [
  /sqlmap/i, /nikto/i, /dirbuster/i, /nmap/i, /masscan/i,
  /w3af/i, /acunetix/i, /havij/i, /gobuster/i, /zgrab/i
];

// Attack Signature Rules
const SQLI_PATTERNS = [
  /(\b(UNION\s+SELECT|SELECT\s+.*\s+FROM|INSERT\s+INTO|DELETE\s+FROM|DROP\s+TABLE|ALTER\s+TABLE|UPDATE\s+.*\s+SET)\b)/i,
  /(\bOR\s+['"]?1['"]?\s*=\s*['"]?1\b)/i,
  /(\bBENCHMARK\s*\(|SLEEP\s*\()/i,
  /(--\s*$|\/\*!.*\*\/)/
];

const XSS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
  /javascript\s*:/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /<svg\/onload/i,
  /document\.cookie/i,
  /<iframe\b/i
];

const RCE_PATTERNS = [
  /;\s*(cat|ls|pwd|whoami|curl|wget|chmod|chown|kill|rm|nc|netcat|bash|sh)\b/i,
  /\|\s*(bash|sh)\b/i,
  /\b(eval|exec|passthru|system|shell_exec)\s*\(/i
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /\/etc\/(passwd|shadow|hosts)/i,
  /c:\\windows\\system32/i
];

// Helper to inspect string against signature rules
const inspectPayloadString = (str: string): { threat: SecurityLog['threatType'] | null; pattern: string } => {
  for (const pat of SQLI_PATTERNS) {
    if (pat.test(str)) return { threat: 'SQL_INJECTION', pattern: pat.toString() };
  }
  for (const pat of XSS_PATTERNS) {
    if (pat.test(str)) return { threat: 'XSS_ATTACK', pattern: pat.toString() };
  }
  for (const pat of RCE_PATTERNS) {
    if (pat.test(str)) return { threat: 'COMMAND_INJECTION', pattern: pat.toString() };
  }
  for (const pat of PATH_TRAVERSAL_PATTERNS) {
    if (pat.test(str)) return { threat: 'PATH_TRAVERSAL', pattern: pat.toString() };
  }
  return { threat: null, pattern: '' };
};

// Deep object inspection
const inspectObject = (obj: any): { threat: SecurityLog['threatType'] | null; details: string } => {
  if (!obj) return { threat: null, details: '' };
  
  if (typeof obj === 'string') {
    const res = inspectPayloadString(obj);
    if (res.threat) return { threat: res.threat, details: `Matched pattern: ${res.pattern} in string: "${obj.slice(0, 50)}"` };
  } else if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const keyInspection = inspectPayloadString(key);
      if (keyInspection.threat) {
        return { threat: keyInspection.threat, details: `Matched pattern in key: ${key}` };
      }
      const valInspection = inspectObject(val);
      if (valInspection.threat) return valInspection;
    }
  }
  return { threat: null, details: '' };
};

// Web Application Firewall (WAF) Middleware
export const wafProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.socket.remoteAddress || '127.0.0.1';

  // 1. IP Ban Enforcement
  if (bannedIPs.has(clientIP)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Your IP address has been flagged and blocked by LUMO Cybersecurity WAF due to policy violations.',
      code: 'IP_BANNED'
    });
  }

  // 2. Malicious Bot Inspection
  const userAgent = req.headers['user-agent'] || '';
  for (const botPat of MALICIOUS_BOT_PATTERNS) {
    if (botPat.test(userAgent)) {
      logIncident(clientIP, req, 'MALICIOUS_BOT', 'CRITICAL', 'BLOCKED', `Blocked vulnerability scanner User-Agent: ${userAgent}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Security policy violation: Malicious automated request scanner detected.',
        code: 'BOT_BLOCKED'
      });
    }
  }

  // 3. WAF Payload Inspection (URL, Query, Params, Body)
  const fullUrl = req.originalUrl || req.url;
  const urlInspection = inspectPayloadString(fullUrl);
  if (urlInspection.threat) {
    logIncident(clientIP, req, urlInspection.threat, 'HIGH', 'BLOCKED', `Attack vector in request URL: ${fullUrl}`);
    return res.status(400).json({
      error: 'Bad Request',
      message: 'LUMO WAF blocked request containing suspicious signature or injection attempt.',
      code: 'ATTACK_SIGNATURE_DETECTED'
    });
  }

  if (req.body) {
    const bodyInspection = inspectObject(req.body);
    if (bodyInspection.threat) {
      logIncident(clientIP, req, bodyInspection.threat, 'CRITICAL', 'BLOCKED', `Attack vector in request body payload: ${bodyInspection.details}`);
      return res.status(400).json({
        error: 'Security Exception',
        message: 'LUMO WAF detected illegal script injection or malicious payload.',
        code: 'PAYLOAD_THREAT_BLOCKED'
      });
    }
  }

  next();
};

// Rate Limiter & Anti-Brute-Force Shield Middleware
export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return next();
  }
  const clientIP = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const path = req.originalUrl || req.url;

  // Strict rate limit for auth, OTP, payment sensitive endpoints (15 req/min)
  const isSensitiveEndpoint = path.includes('/api/auth/') || path.includes('/api/otp/') || path.includes('/api/payments/');
  const maxRequests = isSensitiveEndpoint ? 20 : 200;
  const windowMs = 60 * 1000; // 1 minute window

  const targetMap = isSensitiveEndpoint ? authRateMap : requestRateMap;
  let record = targetMap.get(clientIP);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    targetMap.set(clientIP, record);
  } else {
    record.count++;
  }

  if (record.count > maxRequests) {
    logIncident(clientIP, req, 'RATE_LIMIT_EXCEEDED', isSensitiveEndpoint ? 'HIGH' : 'MEDIUM', 'RATE_LIMITED', `Exceeded request limit (${record.count}/${maxRequests} req/min) on ${path}`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please wait a minute before sending more requests to ${path}.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
    });
  }

  next();
};
