const ALLOWED_ORIGINS = [
  'https://sayag11.github.io',
  'http://localhost:3000',
];

const ALLOWED_TARGETS = {
  '/alerts': 'https://www.oref.org.il/warningMessages/alert/Alerts.json',
  '/history': 'https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json',
  '/history-range': 'https://alerts-history.oref.org.il/Shared/Ajax/GetAlarmsHistory.aspx',
  '/cities': 'https://alerts-history.oref.org.il/Shared/Ajax/GetDistricts.aspx',
};

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const targetBase = ALLOWED_TARGETS[path];
  if (!targetBase) {
    return new Response('Not found', { status: 404 });
  }

  const targetUrl = new URL(targetBase);
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const response = await fetch(targetUrl.toString(), {
    headers: {
      'Accept': 'application/json',
      'Referer': 'https://www.oref.org.il/',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'he',
    },
  });

  const body = await response.arrayBuffer();
  const corsHeaders = getCorsHeaders(request);

  return new Response(body, {
    status: response.status,
    headers: {
      ...corsHeaders,
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'public, max-age=3',
    },
  });
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
