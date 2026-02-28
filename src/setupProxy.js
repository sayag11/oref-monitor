const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
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
};
