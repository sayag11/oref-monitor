const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 3001;
const BUILD_DIR = path.join(__dirname, 'build');

const app = express();

// ─── Disable fingerprinting ─────────────────────────────────────────
app.disable('x-powered-by');

// ─── Security headers via helmet ────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  })
);

// ─── Global rate limit: 120 requests/minute per IP ──────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});
app.use(globalLimiter);

// ─── Stricter API rate limit: 30 requests/minute per IP ─────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'API rate limit exceeded.' },
});

// ─── Block oversized requests (no body expected on GETs) ────────────
app.use((req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 1024) {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }
  next();
});

// ─── Block all non-GET methods ──────────────────────────────────────
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  next();
});

// ─── Sanitize proxy query params (only allow known safe params) ─────
const ALLOWED_PARAMS = new Set(['lang', 'fromDate', 'toDate', 'mode']);
const DATE_PATTERN = /^\d{2}\.\d{2}\.\d{4}$/;

const sanitizeProxyReq = (proxyReq, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  for (const [key] of url.searchParams.entries()) {
    if (!ALLOWED_PARAMS.has(key)) {
      proxyReq.path = proxyReq.path.replace(
        new RegExp(`[?&]${encodeURIComponent(key)}=[^&]*`),
        ''
      );
    }
  }
};

const validateHistoryRangeParams = (req, res, next) => {
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  if (fromDate && !DATE_PATTERN.test(fromDate)) {
    res.status(400).json({ error: 'Invalid fromDate format' });
    return;
  }
  if (toDate && !DATE_PATTERN.test(toDate)) {
    res.status(400).json({ error: 'Invalid toDate format' });
    return;
  }
  next();
};

// ─── Proxy timeout ──────────────────────────────────────────────────
const PROXY_TIMEOUT = 15000;

const orefHeaders = {
  Referer: 'https://www.oref.org.il/',
  'X-Requested-With': 'XMLHttpRequest',
  'Accept-Language': 'he',
};

// ─── API proxy routes (rate-limited) ────────────────────────────────
app.use(
  '/api/alerts',
  apiLimiter,
  createProxyMiddleware({
    target: 'https://www.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/alerts': '/warningMessages/alert/Alerts.json' },
    headers: orefHeaders,
    proxyTimeout: PROXY_TIMEOUT,
    timeout: PROXY_TIMEOUT,
    onProxyReq: sanitizeProxyReq,
  })
);

app.use(
  '/api/history-range',
  apiLimiter,
  validateHistoryRangeParams,
  createProxyMiddleware({
    target: 'https://alerts-history.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/history-range': '/Shared/Ajax/GetAlarmsHistory.aspx' },
    headers: orefHeaders,
    proxyTimeout: PROXY_TIMEOUT,
    timeout: PROXY_TIMEOUT,
    onProxyReq: sanitizeProxyReq,
  })
);

app.use(
  '/api/history',
  apiLimiter,
  createProxyMiddleware({
    target: 'https://www.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/history': '/warningMessages/alert/History/AlertsHistory.json' },
    headers: orefHeaders,
    proxyTimeout: PROXY_TIMEOUT,
    timeout: PROXY_TIMEOUT,
    onProxyReq: sanitizeProxyReq,
  })
);

app.use(
  '/api/cities',
  apiLimiter,
  createProxyMiddleware({
    target: 'https://alerts-history.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/cities': '/Shared/Ajax/GetDistricts.aspx?lang=he' },
    headers: { Referer: 'https://www.oref.org.il/' },
    proxyTimeout: PROXY_TIMEOUT,
    timeout: PROXY_TIMEOUT,
    onProxyReq: sanitizeProxyReq,
  })
);

// ─── Block any other /api/ path ─────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Static files with cache headers ────────────────────────────────
app.use(
  '/static',
  express.static(path.join(BUILD_DIR, 'static'), {
    maxAge: '1y',
    immutable: true,
  })
);

app.use(
  express.static(BUILD_DIR, {
    maxAge: '10m',
    dotfiles: 'deny',
    index: 'index.html',
  })
);

// ─── SPA fallback (only serves index.html, nothing else) ────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

// ─── Start server ───────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`OREF Monitor production server running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.maxHeadersCount = 50;
server.timeout = 30000;
