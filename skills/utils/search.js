#!/usr/bin/env node

/**
 * Avant-Garde UI-UX Skill Search & Media CLI
 * Zero-dependency search engine for human-made design elements, underrated Google Fonts, and Unsplash images.
 * Designed to preserve token windows for coding agents by lazy-loading search results.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Curated High-Quality Fallback Images (Verified hotlinkable Unsplash resources)
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
    description: 'Hand-drawn watercolor paint wash strokes with gold leaf leafing highlights.',
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

// Resolves CSV file paths dynamically
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

// Custom CSV Parser with full quotes handling (Zero-dependency)
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    
    // Create record object
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  return records;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Double quote escaping inside quote blocks
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

// Direct public Unsplash search parser (Zero-dependency HTTP query)
function searchUnsplash(query, perPage = 10) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'unsplash.com',
      port: 443,
      path: `/napi/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`Unsplash HTTP status ${res.statusCode}`));
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
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Output display formatting (JSON vs Markdown)
function renderResults(results, asJson) {
  if (asJson) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log('No results found.');
    return;
  }

  // Determine schema keys dynamically
  const keys = Object.keys(results[0]);
  
  // Dynamic column widths
  const colWidths = {};
  keys.forEach(k => {
    colWidths[k] = k.length;
    results.forEach(row => {
      const valStr = String(row[k] || '');
      if (valStr.length > colWidths[k]) {
        colWidths[k] = valStr.length;
      }
    });
    // Cap columns at 60 chars to prevent terminal wrap disaster
    if (colWidths[k] > 60) colWidths[k] = 60;
  });

  // Render header
  let headerRow = '| ' + keys.map(k => k.toUpperCase().padEnd(colWidths[k])).join(' | ') + ' |';
  let dividerRow = '| ' + keys.map(k => '-'.repeat(colWidths[k])).join(' | ') + ' |';
  
  console.log(headerRow);
  console.log(dividerRow);

  results.forEach(row => {
    const cells = keys.map(k => {
      let cellVal = String(row[k] || '').replace(/\r?\n/g, ' ');
      if (cellVal.length > colWidths[k]) {
        cellVal = cellVal.substring(0, colWidths[k] - 3) + '...';
      }
      return cellVal.padEnd(colWidths[k]);
    });
    console.log('| ' + cells.join(' | ') + ' |');
  });
}

// Direct DuckDuckGo zero-key web search parser (Zero-dependency HTTPS query)
function searchWeb(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.duckduckgo.com',
      port: 443,
      path: `/?q=${encodeURIComponent(query)}&format=json&no_html=1`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`Web search HTTP status ${res.statusCode}`));
          }
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', e => reject(e));
    req.end();
  });
}


// Help documentation
function printHelp() {
  console.log(`
========================================================================
   AVANT-GARDE UI-UX SKILL - ZERO-TOKEN SEARCH CLI v2.0
========================================================================

Query reference database items dynamically to preserve agent token windows.

Usage:
  node search.js [options]

Options:
  --elements <query>       Search 1000 Handcrafted Design Elements CSV
  --category <category>    Filter Elements search by category
  --fonts <query>          Search 1000 Underrated Google Fonts CSV
  --mood <mood>            Filter Fonts search by mood profile
  --classification <class> Filter Fonts search by classification (Serif, Sans Serif, Monospace, etc.)
  --images <query>         Search royalty-free Unsplash photography & fallbacks
  --web <query>            Execute a zero-dependency deeply integrated browser web search
  --view                   Fetch and visualize the top image result directly in ANSI truecolor
  --json                   Output strictly in JSON format
  --help                   Display this manual

SVG Vector Logo Engine:
  You are equipped with a mathematically precise SVG brand logo generator! Run it via:
  node skills/utils/svg-generator.js --type <bento|organic|brutalist|cinematic> --name "<brand>" --output "<file.svg>"

Examples:
  node search.js --elements "ink bleed"
  node search.js --elements "button" --category "Button"
  node search.js --fonts "Instrument"
  node search.js --fonts "elegant" --classification "Serif"
  node search.js --images "wellness" --view
  `);
}

// Core execution router
async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    if (isJson) {
      console.log(JSON.stringify({ error: "Help requested or no arguments provided." }));
      process.exit(1);
    } else {
      printHelp();
      return;
    }
  }

  // Parse command arguments
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      params[key] = val;
    }
  }

  // --- Category 4: Web Search ---
  if (params.web) {
    if (typeof params.web !== 'string') {
      if (isJson) {
        console.log(JSON.stringify({ error: "Please provide a query string for --web search." }));
      } else {
        console.error('Error: Please provide a query string for --web search.');
      }
      process.exit(1);
    }
    
    const query = params.web;
    if (!isJson) {
      console.log(`\n=============================================================`);
      console.log(`🔍 DEEP INTEGRATED BROWSER SEARCH — QUERYING WEB`);
      console.log(`🔎 Term: "${query}"`);
      console.log(`=============================================================\n`);
    }
    
    try {
      const data = await searchWeb(query);
      const results = [];
      
      if (data.AbstractText) {
        results.push({
          source: data.AbstractSource || 'Wikipedia',
          summary: data.AbstractText,
          url: data.AbstractURL
        });
      }
      
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 5).forEach(topic => {
          if (topic.Text) {
            results.push({
              source: 'Related Topic',
              summary: topic.Text,
              url: topic.FirstURL || ''
            });
          }
        });
      }
      
      if (results.length === 0) {
        if (!isJson) {
          console.log(`🏜️ No direct Wikipedia/Instant Answer results found. Try alternative keywords.`);
        } else {
          console.log(JSON.stringify([]));
        }
        return;
      }
      
      renderResults(results, isJson);
    } catch (err) {
      if (isJson) {
        console.log(JSON.stringify({ error: `Web search query failed: ${err.message}` }));
      } else {
        console.error(`❌ [Search Failure] Web search query failed: ${err.message}`);
      }
      process.exit(1);
    }
    return;
  }

  // --- Category 1: Design Elements CSV ---
  if (params.elements) {
    const csvPath = findCSVPath('1000-human-made-design-elements.csv');
    if (!csvPath) {
      if (isJson) {
        console.log(JSON.stringify({ error: "Could not locate 1000-human-made-design-elements.csv in workspace paths." }));
      } else {
        console.error('Error: Could not locate 1000-human-made-design-elements.csv in workspace paths.');
      }
      process.exit(1);
    }

    const elements = parseCSV(csvPath);
    let filtered = elements;

    // Filter by query
    if (typeof params.elements === 'string') {
      const query = params.elements.toLowerCase();
      filtered = filtered.filter(item => 
        (item['Design Element'] && item['Design Element'].toLowerCase().includes(query)) ||
        (item['Description'] && item['Description'].toLowerCase().includes(query)) ||
        (item['Human Quality Signal'] && item['Human Quality Signal'].toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (params.category && typeof params.category === 'string') {
      const cat = params.category.toLowerCase();
      filtered = filtered.filter(item => 
        item['Category'] && item['Category'].toLowerCase() === cat
      );
    }

    // Cap output to conserve terminal space
    filtered = filtered.slice(0, 15);
    renderResults(filtered.map(item => ({
      id: item['ID'],
      category: item['Category'],
      element: item['Design Element'],
      description: item['Description'],
      quality_signal: item['Human Quality Signal']
    })), isJson);
    return;
  }

  // --- Category 2: Underrated Google Fonts CSV ---
  if (params.fonts) {
    const csvPath = findCSVPath('1000-underrated-google-fonts.csv');
    if (!csvPath) {
      if (isJson) {
        console.log(JSON.stringify({ error: "Could not locate 1000-underrated-google-fonts.csv in workspace paths." }));
      } else {
        console.error('Error: Could not locate 1000-underrated-google-fonts.csv in workspace paths.');
      }
      process.exit(1);
    }

    const fonts = parseCSV(csvPath);
    let filtered = fonts;

    // Filter by query
    if (typeof params.fonts === 'string') {
      const query = params.fonts.toLowerCase();
      filtered = filtered.filter(item => 
        (item['Font Name'] && item['Font Name'].toLowerCase().includes(query)) ||
        (item['Use Case'] && item['Use Case'].toLowerCase().includes(query)) ||
        (item['Mood/Personality'] && item['Mood/Personality'].toLowerCase().includes(query)) ||
        (item['Pairing Suggestion'] && item['Pairing Suggestion'].toLowerCase().includes(query))
      );
    }

    // Filter by classification
    if (params.classification && typeof params.classification === 'string') {
      const cls = params.classification.toLowerCase();
      filtered = filtered.filter(item => 
        item['Classification'] && item['Classification'].toLowerCase().includes(cls)
      );
    }

    // Filter by mood
    if (params.mood && typeof params.mood === 'string') {
      const md = params.mood.toLowerCase();
      filtered = filtered.filter(item => 
        item['Mood/Personality'] && item['Mood/Personality'].toLowerCase().includes(md)
      );
    }

    // Cap output
    filtered = filtered.slice(0, 10);
    renderResults(filtered.map(item => ({
      name: item['Font Name'],
      classification: item['Classification'],
      use_case: item['Use Case'],
      mood: item['Mood/Personality'],
      pairing: item['Pairing Suggestion']
    })), isJson);
    return;
  }

  // --- Category 3: Image / Media Search ---
  if (params.images) {
    if (typeof params.images !== 'string') {
      if (isJson) {
        console.log(JSON.stringify({ error: "Please provide a query string for --images search." }));
      } else {
        console.error('Error: Please provide a query string for --images search.');
      }
      process.exit(1);
    }

    const query = params.images;
    const shouldView = params.view;
    
    // Filter Fallback database first
    const fallbacks = LOCAL_FALLBACK_IMAGES.filter(item =>
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );

    let finalResults = [];
    let usedFallback = false;

    try {
      // Query real Unsplash public API
      const liveResults = await searchUnsplash(query);
      let merged = [...liveResults];
      if (merged.length < 5) {
        merged = [...merged, ...fallbacks];
      }
      
      // Distinct unique URL paths
      const seen = new Set();
      finalResults = merged.filter(item => {
        const has = seen.has(item.url);
        seen.add(item.url);
        return !has;
      }).slice(0, 8);
    } catch (err) {
      usedFallback = true;
      finalResults = fallbacks.length > 0 ? fallbacks : LOCAL_FALLBACK_IMAGES.slice(0, 5);
    }

    // Standard text reporting
    if (usedFallback && !isJson && !shouldView) {
      console.log(`\n[Offline Fallback Mode] Query: "${query}" - Network lookup failed. Using local curated premium database:`);
    }
    
    if (!shouldView) {
      renderResults(finalResults, isJson);
      return;
    }

    // --- VISUAL MULTI-MODAL BRIDGE MODE ---
    if (finalResults.length === 0) {
      if (isJson) {
        console.log(JSON.stringify({ error: "No images found to visualize." }));
      } else {
        console.log('No images found to visualize.');
      }
      return;
    }

    const targetImage = finalResults[0];
    
    // Unsplash URL allows custom sizing. Make a tiny thumbnail request (20x15 pixels) to fit cleanly in terminal outputs
    let tinyUrl = targetImage.url;
    if (tinyUrl.includes('unsplash.com')) {
      tinyUrl = tinyUrl.split('?')[0] + '?fit=crop&w=20&h=15&fm=png&q=80';
    } else {
      // Fallback local items are also Unsplash URLs, so they support the same transformation!
      tinyUrl = tinyUrl.split('?')[0] + '?fit=crop&w=20&h=15&fm=png&q=80';
    }

    if (!isJson) {
      console.log(`\n=============================================================`);
      console.log(`👁️  DYNAMIC MULTI-MODAL AI VISION BRIDGE — DECODING THUMBNAIL`);
      console.log(`📷 Subject: "${targetImage.description}"`);
      console.log(`👤 Captured by: ${targetImage.author} (${targetImage.author_url})`);
      console.log(`=============================================================\n`);
      console.log(`Fetching PNG buffer from: ${tinyUrl} ...`);
    }

    // Zero-dependency HTTPS downloader
    https.get(tinyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            throw new Error(`HTTP status ${res.statusCode}`);
          }
          const buffer = Buffer.concat(chunks);
          
          // Decode PNG binary buffer live!
          const { parsePNG, analyzeAndVisualize } = require('./image-analyzer');
          const pngInfo = parsePNG(buffer);
          const analysis = analyzeAndVisualize(pngInfo);
          
          if (isJson) {
            console.log(JSON.stringify({
              meta: targetImage,
              analysis: {
                avgLuminance: analysis.avgLuminance,
                focalCenter: `${analysis.verticalFocus}-${analysis.horizontalFocus}`,
                dominantColors: analysis.sortedColors,
                asciiLuminanceMap: analysis.asciiGrid
              }
            }, null, 2));
            return;
          }

          console.log('\n--- TERMINAL TRUECOLOR VISUAL DISPLAY ---');
          console.log(analysis.ansiGrid);
          
          console.log('--- TEXT-ONLY LUMINANCE BLUEPRINT MAP (For non-multimodal AI) ---');
          console.log(analysis.asciiGrid);
          
          console.log('--- SEMANTIC ANALYSIS REPORT ---');
          console.log(`- Average Luminance: ${analysis.avgLuminance}% (Luminance scale: 0% dark -> 100% bright)`);
          console.log(`- Visual Weight Center: ${analysis.verticalFocus} - ${analysis.horizontalFocus}`);
          console.log(`- Dominant Color Palette (Top 3):`);
          analysis.sortedColors.forEach((color, i) => {
            console.log(`  [${i + 1}] RGB: ${color.rgb} | HSL: ${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}% | 2026 Token: ${color.oklch}`);
          });
          console.log('\n*Note: Non-multimodal agents can parse the Luminance Blueprint map to understand spatial shapes, focal structures, and layouts!*');
        } catch (e) {
          if (isJson) {
            console.log(JSON.stringify({ error: `Visual decode failed: ${e.message}`, meta: targetImage }, null, 2));
          } else {
            console.error(`\n[Vision Bridge Error] Unable to decode PNG thumbnail dynamically: ${e.message}`);
            console.log(`Direct Image URL: ${targetImage.url}`);
          }
          process.exit(1);
        }
      });
    }).on('error', (e) => {
      if (isJson) {
        console.log(JSON.stringify({ error: `Fetch failed: ${e.message}`, meta: targetImage }, null, 2));
      } else {
        console.error(`\n[Vision Bridge Error] Unable to fetch PNG thumbnail stream: ${e.message}`);
        console.log(`Direct Image URL: ${targetImage.url}`);
      }
      process.exit(1);
    });

    return;
  }

  // Default warning if option syntax was wrong
  if (isJson) {
    console.log(JSON.stringify({ error: "Unknown arguments or invalid options configuration." }));
  } else {
    console.error('Error: Unknown arguments or invalid options configuration.');
    printHelp();
  }
  process.exit(1);
}

main().catch(err => {
  const isJson = process.argv.includes('--json');
  if (isJson) {
    console.log(JSON.stringify({ error: `Execution failure: ${err.message}` }));
  } else {
    console.error('Execution failure:', err);
  }
  process.exit(1);
});
