const https = require('https');
const url = require('url');

const TARGETS = {
  alerts: 'https://www.oref.org.il/warningMessages/alert/Alerts.json',
  history: 'https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json',
  'history-range': 'https://alerts-history.oref.org.il/Shared/Ajax/GetAlarmsHistory.aspx',
  cities: 'https://alerts-history.oref.org.il/Shared/Ajax/GetDistricts.aspx',
};

module.exports = (req, res) => {
  const parsed = url.parse(req.url, true);
  const endpoint = parsed.query.endpoint;

  if (!endpoint || !TARGETS[endpoint]) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing or invalid endpoint param' }));
    return;
  }

  const targetBase = TARGETS[endpoint];
  const targetUrl = new URL(targetBase);

  Object.entries(parsed.query).forEach(([key, val]) => {
    if (key !== 'endpoint' && typeof val === 'string') {
      targetUrl.searchParams.set(key, val);
    }
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const options = {
    hostname: targetUrl.hostname,
    path: targetUrl.pathname + targetUrl.search,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Referer: 'https://www.oref.org.il/',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'he',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    const chunks = [];
    proxyRes.on('data', (chunk) => chunks.push(chunk));
    proxyRes.on('end', () => {
      const body = Buffer.concat(chunks);
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3');
      res.statusCode = proxyRes.statusCode || 200;
      res.end(body);
    });
  });

  proxyReq.on('error', () => {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'Upstream request failed' }));
  });

  proxyReq.setTimeout(12000, () => {
    proxyReq.destroy();
    res.statusCode = 504;
    res.end(JSON.stringify({ error: 'Upstream timeout' }));
  });

  proxyReq.end();
};
