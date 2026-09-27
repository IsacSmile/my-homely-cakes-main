const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Global safety error handlers to prevent premature process exit
process.on('uncaughtException', (err) => {
  console.error('[GoDaddy Startup/Runtime Warning] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[GoDaddy Startup/Runtime Warning] Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log(`[GoDaddy App Initialization] Preparing Next.js server on host: ${hostname}, port: ${port} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      // Preserve public Host header when running behind reverse proxies (Apache / GoDaddy cPanel / Nginx)
      if (req.headers['x-forwarded-host']) {
        req.headers.host = req.headers['x-forwarded-host'].split(',')[0].trim();
      } else if (!dev && req.headers.host && (req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1'))) {
        if (process.env.NEXTAUTH_URL) {
          try {
            const parsed = new URL(process.env.NEXTAUTH_URL);
            req.headers.host = parsed.host;
          } catch (_) {}
        }
      }

      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling HTTP request:', req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error(`[Fatal Startup Error] Could not bind server to ${hostname}:${port}:`, err);
      process.exit(1);
    }
    console.log(`> [GoDaddy Ready] Next.js server successfully started and listening on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('[Fatal Startup Error] Failed to prepare Next.js application:', err);
  process.exit(1);
});
