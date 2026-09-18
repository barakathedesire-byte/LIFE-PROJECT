import express from 'express';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import sellerRoutes from './routes/seller.js';
import salesRoutes from './routes/sales.js';
import warehouseRoutes from './routes/warehouse.js';
import deliveryRoutes from './routes/delivery.js';
import pickupRoutes from './routes/pickup.js';
import supportRoutes from './routes/support.js';
import moderationRoutes from './routes/moderation.js';
import returnsRoutes from './routes/returns.js';
import adminRoutes from './routes/admin.js';
import promotionRoutes from './routes/promotions.js';
import financeRoutes from './routes/finance.js';
import configRoutes from './routes/config.js';
import workspaceRoutes from './routes/workspace.js';
import otpRoutes from './routes/otp.js';
import messagingRoutes from './routes/messaging.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import liveRoutes from './routes/live.js';

import {
  securityHeadersMiddleware,
  wafProtectionMiddleware,
  rateLimiterMiddleware
} from './middleware/security.js';

import { productionGuard } from './middleware/productionGuard.js';

export function createApp() {
  const app = express();

  // 1. Production Security Guard (Blocks Demo/Test endpoints & bypass params)
  app.use('/api', productionGuard);

  // Intercept and purge X-Frame-Options completely to allow iframe rendering
  app.use((req, res, next) => {
    const rawSetHeader = res.setHeader;
    res.setHeader = function (name: string, value: any) {
      if (typeof name === 'string' && name.toLowerCase() === 'x-frame-options') {
        return this;
      }
      return rawSetHeader.call(this, name, value);
    };

    const rawWriteHead = res.writeHead;
    res.writeHead = function (...args: any[]) {
      res.removeHeader('x-frame-options');
      res.removeHeader('X-Frame-Options');
      return rawWriteHead.apply(this, args as any);
    };
    next();
  });

  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cybersecurity WAF & Rate Limiter Layer
  // Skip rate limiting in testing to avoid false failures
  if (process.env.NODE_ENV !== 'test') {
    app.use('/api', wafProtectionMiddleware);
    app.use('/api', rateLimiterMiddleware);
  }

  // Global auth middleware
  app.use(authMiddleware);

  // Mount API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/sellers', sellerRoutes);
  app.use('/api/promotions', promotionRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/warehouses', warehouseRoutes);
  app.use('/api/delivery', deliveryRoutes);
  app.use('/api/pickup', pickupRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/moderation', moderationRoutes);
  app.use('/api/returns', returnsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/otp', otpRoutes);
  app.use('/api/messaging', messagingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/live', liveRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platform: 'LUMO Multi-Vendor Marketplace', version: '2.0.0' });
  });

  return app;
}
