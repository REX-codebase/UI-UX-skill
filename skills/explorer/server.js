const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');

// Curated high-quality local images matching the CLI fallbacks
const LOCAL_FALLBACK_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'Serene fluid abstract texture with organic curves and pastel gradients.',
    category: 'abstract',
    author: 'Milad Fakurian',
    author_url: 'https://unsplash.com/@fakurian'
  },
  {
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    description: 'Minimalist 3D glassmorphism bento card floating element with colorful ambient glow.',
    category: 'bento',
    author: 'Daniel Olah',
    author_url: 'https://unsplash.com/@danesz'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Serene sand texture beach sunset, representing wellness and natural breathing space.',
    category: 'wellness',
    author: 'Sean Oulashin',
    author_url: 'https://unsplash.com/@seanoulashin'
  },
  {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    description: 'Macro shot of electrical components and dark circuit traces with technical precision.',
    category: 'tech',
    author: 'Alexandre Debiève',
    author_url: 'https://unsplash.com/@alexandre_debieve'
  },
  {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    description: 'Dark-mode technical UI grid overlay with green coding details.',
    category: 'tech',
    author: 'Markus Spiske',
    author_url: 'https://unsplash.com/@markusspiske'
  },
  {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Architectural geometry with dynamic shadows and raw concrete textures.',
    category: 'brutalist',
    author: 'Sora Sagano',
    author_url: 'https://unsplash.com/@sorasagano'
  },
  {
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80',
    description: 'Moody green forest mist and organic pine needles with watercolor wash tones.',
    category: 'wellness',
    author: 'Kalen Emsley',
    author_url: 'https://unsplash.com/@kalenemsley'
  },
  {
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
    description: 'Typewriter key close-up with rough ink bleed letterforms and metal textures.',
    category: 'retro',
    author: 'Florian Klauer',
    author_url: 'https://unsplash.com/@florianklauer'
  },
  {
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
    description: 'Hand-drawn watercolor paint wash strokes with gold leaf highlights.',
    category: 'illustration',
    author: 'Fiona Art',
    author_url: 'https://unsplash.com/@fionaart'
  },
  {
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    description: 'Handcrafted floral art painting with high-contrast organic textures and brush strokes.',
    category: 'illustration',
    author: 'Europeana',
    author_url: 'https://unsplash.com/@europeana'
  }
];

// Resolves CSV file paths
function findCSVPath(filename) {
  const searchPaths = [
    path.join(process.cwd(), filename),
    path.join(__dirname, '..', '..', filename),
    path.join(__dirname, '..', filename),
    path.join(__dirname, filename)
  ];
  for (const p of searchPaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// Simple line parser helper
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parses design element/font CSV files
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  return records;
}

// Dynamic Unsplash API queries
function fetchUnsplash(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'unsplash.com',
      port: 443,
      path: `/napi/search/photos?query=${encodeURIComponent(query)}&per_page=12`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`Status ${res.statusCode}`));
          }
          const parsed = JSON.parse(data);
          if (parsed && parsed.results) {
            const formatted = parsed.results.map(item => ({
              url: item.urls.regular,
              thumb: item.urls.small || item.urls.thumb,
              description: item.description || item.alt_description || 'Unsplash photography element',
              category: 'photography',
              author: item.user.name,
              author_url: item.user.links.html
            }));
            resolve(formatted);
          } else {
            resolve([]);
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- API Endpoint: Design Elements ---
  if (pathname === '/api/elements') {
    const csvPath = findCSVPath('1000-human-made-design-elements.csv');
    if (!csvPath) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Elements CSV database not found.' }));
      return;
    }

    const elements = parseCSV(csvPath);
    let results = elements;

    const query = parsedUrl.query.q;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(item => 
        (item['Design Element'] && item['Design Element'].toLowerCase().includes(q)) ||
        (item['Description'] && item['Description'].toLowerCase().includes(q)) ||
        (item['Human Quality Signal'] && item['Human Quality Signal'].toLowerCase().includes(q))
      );
    }

    const category = parsedUrl.query.category;
    if (category) {
      const cat = category.toLowerCase();
      results = results.filter(item => 
        item['Category'] && item['Category'].toLowerCase() === cat
      );
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(results));
    return;
  }

  // --- API Endpoint: Google Fonts ---
  if (pathname === '/api/fonts') {
    const csvPath = findCSVPath('1000-underrated-google-fonts.csv');
    if (!csvPath) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Fonts CSV database not found.' }));
      return;
    }

    const fonts = parseCSV(csvPath);
    let results = fonts;

    const query = parsedUrl.query.q;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(item => 
        (item['Font Name'] && item['Font Name'].toLowerCase().includes(q)) ||
        (item['Use Case'] && item['Use Case'].toLowerCase().includes(q)) ||
        (item['Mood/Personality'] && item['Mood/Personality'].toLowerCase().includes(q)) ||
        (item['Pairing Suggestion'] && item['Pairing Suggestion'].toLowerCase().includes(q))
      );
    }

    const classification = parsedUrl.query.classification;
    if (classification) {
      const cls = classification.toLowerCase();
      results = results.filter(item => 
        item['Classification'] && item['Classification'].toLowerCase().includes(cls)
      );
    }

    const mood = parsedUrl.query.mood;
    if (mood) {
      const md = mood.toLowerCase();
      results = results.filter(item => 
        item['Mood/Personality'] && item['Mood/Personality'].toLowerCase().includes(md)
      );
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(results));
    return;
  }

  // --- API Endpoint: Image Search ---
  if (pathname === '/api/images') {
    const query = parsedUrl.query.q || '';
    const fallbacks = LOCAL_FALLBACK_IMAGES.filter(item =>
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

    if (!query) {
      res.end(JSON.stringify(LOCAL_FALLBACK_IMAGES));
      return;
    }

    try {
      const live = await fetchUnsplash(query);
      let merged = [...live];
      if (merged.length < 6) {
        merged = [...merged, ...fallbacks];
      }
      // Deduplicate
      const seen = new Set();
      merged = merged.filter(item => {
        const has = seen.has(item.url);
        seen.add(item.url);
        return !has;
      });
      res.end(JSON.stringify(merged));
    } catch (e) {
      // Offline fallback
      const results = fallbacks.length > 0 ? fallbacks : LOCAL_FALLBACK_IMAGES;
      res.end(JSON.stringify(results));
    }
    return;
  }

  // --- Static File Server ---
  // Resolve path to the explorer frontend
  let relativeFilePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(__dirname, relativeFilePath);

  // Security gate: ensure request stays inside explorer folder
  if (!filePath.startsWith(path.join(__dirname))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

const PORT = 3000;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is occupied. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('Server failure:', e);
  }
});

server.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`🚀 Avant-Garde UI-UX visual explorer is live!`);
  console.log(`🔗 Open http://localhost:${server.address().port} in your browser.`);
  console.log(`================================================================\n`);
});
