const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const WORKSPACE_DIR = path.join(process.cwd(), '.vg-canvas');
const STATE_FILE = path.join(WORKSPACE_DIR, 'state.json');
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const OUTPUT_HTML = path.join(DIST_DIR, 'index.html');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper: Ensure standard directories exist
function ensureDirs() {
  if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Helper: Run the CLI compile programmatically
function triggerCliCompile() {
  const cliPath = path.join(__dirname, 'cli.js');
  const { execSync } = require('child_process');
  try {
    execSync(`node "${cliPath}" compile`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.error('Failed to execute canvas compile command:', e);
    return false;
  }
}

// Helper: Run CLI audits programmatically
function getCliAudits() {
  const cliPath = path.join(__dirname, 'cli.js');
  const { execSync } = require('child_process');
  try {
    const raw = execSync(`node "${cliPath}" test`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    // Parse logs and score manually from CLI or run code directly
    // Running internal auditor calculations directly is more robust:
    const cliModule = require('./cli');
    // If programmatically imported, run audits directly:
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    // Since cli.js is executed as shell, we can import its helper if exported.
    // To be perfectly safe, let's run the internal auditor directly here:
    return runAuditsInternal(state);
  } catch (e) {
    // If import fails, run manual parsing
    try {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return runAuditsInternal(state);
    } catch (err) {
      return { score: 0, status: 'FAIL', logs: [{ type: 'CRITICAL', message: 'Unable to parse state: ' + err.message }] };
    }
  }
}

// Re-implementation of contrast logic for API queries
function hexToRgb(hex) {
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calcAPCA(txtHex, bgHex) {
  const txtColor = hexToRgb(txtHex);
  const bgColor = hexToRgb(bgHex);
  const Ytxt = getLuminance(txtColor.r, txtColor.g, txtColor.b);
  const Ybg = getLuminance(bgColor.r, bgColor.g, bgColor.b);
  if (Math.abs(Ybg - Ytxt) < 0.0005) return 0;
  let Lc = Ybg > Ytxt ? (Math.pow(Ybg, 0.56) - Math.pow(Ytxt, 0.62)) * 175 : (Math.pow(Ybg, 0.65) - Math.pow(Ytxt, 0.55)) * 175;
  return Math.round(Lc);
}

function runAuditsInternal(state) {
  const reports = [];
  let score = 100;

  state.layers.forEach((layer, idx) => {
    const isAlignX = layer.x % state.canvas.grid === 0;
    const isAlignY = layer.y % state.canvas.grid === 0;
    const isAlignW = layer.w % state.canvas.grid === 0;
    const isAlignH = layer.h % state.canvas.grid === 0;

    if (!isAlignX || !isAlignY || !isAlignW || !isAlignH) {
      score -= 2;
      reports.push({
        type: 'GRID_ALIGNMENT_WARN',
        severity: 'low',
        message: `Layer [${layer.name || idx}] coordinate dimensions is off-grid. X:${layer.x}, Y:${layer.y}, W:${layer.w}, H:${layer.h} (8px grid expected).`
      });
    }
  });

  state.layers.forEach((layer, idx) => {
    if (layer.interactive) {
      if (layer.w < 44 || layer.h < 44) {
        score -= 10;
        reports.push({
          type: 'FITTS_LAW_ERROR',
          severity: 'high',
          message: `Interactive target [${layer.name || idx}] tap bounding size is too small: ${layer.w}x${layer.h}px. Standard touch targets require at least 44x44px.`
        });
      }
    }
  });

  state.layers.forEach((layer, idx) => {
    if (layer.type === 'text') {
      const parentBg = state.canvas.bg;
      const contrast = calcAPCA(layer.color || '#ffffff', parentBg);
      const isHeader = (layer.size || 24) >= 32;
      const requiredContrast = isHeader ? 60 : 75;

      if (Math.abs(contrast) < requiredContrast) {
        score -= 8;
        reports.push({
          type: 'CONTRAST_FAIL',
          severity: 'high',
          message: `Typography element [${layer.name || idx}] color contrast is below standard: ${contrast} Lc (Required: >${requiredContrast} Lc against background ${parentBg}).`
        });
      }
    }
  });

  return {
    testSuite: 'Avant-Garde OS Visual Auditor',
    score: Math.max(0, score),
    status: score >= 90 ? 'PASS' : score >= 75 ? 'WARNING' : 'FAIL',
    timestamp: new Date().toISOString(),
    logs: reports
  };
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set default CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // --- API Endpoint: Get State ---
  if (pathname === '/api/state' && req.method === 'GET') {
    ensureDirs();
    if (!fs.existsSync(STATE_FILE)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Canvas state not initialized.' }));
      return;
    }
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
    return;
  }

  // --- API Endpoint: Update State ---
  if (pathname === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        ensureDirs();
        fs.writeFileSync(STATE_FILE, JSON.stringify(parsed, null, 2), 'utf8');
        // Auto compile on update
        triggerCliCompile();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload: ' + e.message }));
      }
    });
    return;
  }

  // --- API Endpoint: Compile ---
  if (pathname === '/api/compile' && req.method === 'POST') {
    const success = triggerCliCompile();
    res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success }));
    return;
  }

  // --- API Endpoint: Visual Test Suite ---
  if (pathname === '/api/test' && req.method === 'GET') {
    const results = getCliAudits();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
    return;
  }

  // --- Serve Compiled Client View ---
  if (pathname.startsWith('/compiled/')) {
    const relativePath = pathname.replace('/compiled/', '');
    const cleanPath = relativePath === '' ? 'index.html' : relativePath;
    const targetFile = path.join(DIST_DIR, cleanPath);

    // Security check: stay inside dist folder
    if (!targetFile.startsWith(DIST_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access Denied');
      return;
    }

    fs.stat(targetFile, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Compiled index.html not found. Run compile first.');
        return;
      }
      const ext = path.extname(targetFile).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
      fs.createReadStream(targetFile).pipe(res);
    });
    return;
  }

  // --- Serve Dashboard Front-end ---
  const relativeFilePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(PUBLIC_DIR, relativeFilePath);

  // Security gate
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 File Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = 3010;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} occupied. Trying ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', e);
  }
});

server.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`💻 Avant-Garde Headless Design OS Dashboard server is live!`);
  console.log(`🔗 Dashboard: http://localhost:${server.address().port}`);
  console.log(`🔗 Compiled Frame: http://localhost:${server.address().port}/compiled/index.html`);
  console.log(`================================================================\n`);
});
