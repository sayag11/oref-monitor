const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 3001;

const app = express();

const orefHeaders = {
  Referer: 'https://www.oref.org.il/',
  'X-Requested-With': 'XMLHttpRequest',
  'Accept-Language': 'he',
};

app.use(
  '/api/alerts',
  createProxyMiddleware({
    target: 'https://www.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/alerts': '/warningMessages/alert/Alerts.json' },
    headers: orefHeaders,
  })
);

app.use(
  '/api/history-range',
  createProxyMiddleware({
    target: 'https://alerts-history.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/history-range': '/Shared/Ajax/GetAlarmsHistory.aspx' },
    headers: orefHeaders,
  })
);

app.use(
  '/api/history',
  createProxyMiddleware({
    target: 'https://www.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/history': '/warningMessages/alert/History/AlertsHistory.json' },
    headers: orefHeaders,
  })
);

app.use(
  '/api/cities',
  createProxyMiddleware({
    target: 'https://alerts-history.oref.org.il',
    changeOrigin: true,
    pathRewrite: { '^/api/cities': '/Shared/Ajax/GetDistricts.aspx?lang=he' },
    headers: { Referer: 'https://www.oref.org.il/' },
  })
);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OREF Monitor production server running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
});
