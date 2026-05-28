#!/usr/bin/env node

/**
 * Avant-Garde UI-UX Headless Vector Design OS (vg-os)
 * Dynamic coordinate-based vector canvas engine, responsive compiler, 
 * zero-dependency visual terminal feedback stream, and programmatic visual auditor.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const orchestrator = require('./agents/orchestrator');

const WORKSPACE_DIR = path.join(process.cwd(), '.vg-canvas');
const STATE_FILE = path.join(WORKSPACE_DIR, 'state.json');
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const OUTPUT_HTML = path.join(DIST_DIR, 'index.html');

// Helper to ensure workspace directories exist
function ensureDirs() {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
}

// Helper to load canvas state
function loadState() {
  ensureDirs();
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {
      // Return default if corrupted
    }
  }
  return {
    canvas: { width: 1280, height: 800, bg: '#0b0c10', grid: 8 },
    gradients: [],
    layers: []
  };
}

// Helper to save canvas state
function saveState(state) {
  ensureDirs();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

// Convert Hex to RGB
function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Convert RGB to Luminance
function getLuminance(r, g, b) {
  // Standard relative luminance formula
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Standard APCA Contrast Calculator
function calcAPCA(txtHex, bgHex) {
  const txtColor = hexToRgb(txtHex);
  const bgColor = hexToRgb(bgHex);
  
  const Ytxt = getLuminance(txtColor.r, txtColor.g, txtColor.b);
  const Ybg = getLuminance(bgColor.r, bgColor.g, bgColor.b);

  let Lc = 0;
  const delta = 0.0005;

  // Fit standard APCA math scaling
  if (Math.abs(Ybg - Ytxt) < delta) return 0;

  if (Ybg > Ytxt) {
    Lc = (Math.pow(Ybg, 0.56) - Math.pow(Ytxt, 0.62)) * 175;
  } else {
    Lc = (Math.pow(Ybg, 0.65) - Math.pow(Ytxt, 0.55)) * 175;
  }

  // Filter visual threshold
  if (Math.abs(Lc) < 0.1) return 0;
  return Math.round(Lc);
}

// Compile vector canvas into responsive glassmorphic HTML/CSS Layout
function compileCanvas(state) {
  const { width, height, bg } = state.canvas;

  // Prepare Gradient defs
  let gradientCss = '';
  state.gradients.forEach(grad => {
    gradientCss += `
    .grad-${grad.id} {
      background: ${grad.type}-gradient(${grad.angle || 135}deg, ${grad.colors.join(', ')});
    }`;
  });

  // Prepare layer styles and tags
  let elementsHtml = '';
  let layerCss = '';

  state.layers.forEach((layer, idx) => {
    const classId = `layer-${idx}`;
    let style = `
    .${classId} {
      position: absolute;
      left: calc(${layer.x} / ${width} * 100%);
      top: calc(${layer.y} / ${height} * 100%);
      width: calc(${layer.w} / ${width} * 100%);
      height: calc(${layer.h} / ${height} * 100%);
      z-index: ${layer.zIndex || (idx + 1) * 10};
      box-sizing: border-box;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }`;

    let content = '';

    if (layer.type === 'rect') {
      let background = layer.fill || '#1f2833';
      if (background.startsWith('url(#') && background.endsWith(')')) {
        const gradId = background.slice(5, -1);
        style += `\n    .${classId} { background: var(--grad-${gradId}, #1f2833); }`;
      } else {
        style += `\n    .${classId} { background: ${background}; }`;
      }
      if (layer.radius) {
        style += `\n    .${classId} { border-radius: ${layer.radius}px; }`;
      }
      if (layer.blur) {
        style += `\n    .${classId} { backdrop-filter: blur(${layer.blur}px); }`;
      }
      if (layer.border) {
        style += `\n    .${classId} { border: ${layer.border.width || 1}px solid ${layer.border.color || '#fff'}; }`;
      }
      if (layer.interactive) {
        style += `
        .${classId}:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }`;
      }
      elementsHtml += `    <div class="canvas-item ${classId}" id="${layer.name || 'rect-' + idx}"></div>\n`;
    } else if (layer.type === 'circle') {
      style += `\n    .${classId} { background: ${layer.fill || '#ff3366'}; border-radius: 50%; }`;
      elementsHtml += `    <div class="canvas-item ${classId}" id="${layer.name || 'circle-' + idx}"></div>\n`;
    } else if (layer.type === 'text') {
      style += `
      .${classId} {
        color: ${layer.color || '#ffffff'};
        font-family: '${layer.font || 'Outfit'}', sans-serif;
        font-size: calc(${layer.size || 24}px * (100vw / ${width}));
        font-weight: ${layer.weight || 400};
        display: flex;
        align-items: center;
        justify-content: ${layer.align === 'center' ? 'center' : layer.align === 'right' ? 'flex-end' : 'flex-start'};
        white-space: pre-wrap;
      }`;
      elementsHtml += `    <div class="canvas-item ${classId}" id="${layer.name || 'text-' + idx}">${layer.content || ''}</div>\n`;
    }

    layerCss += style + '\n';
  });

  // Load Custom Gradients into CSS variables
  let gradVars = '';
  state.gradients.forEach(grad => {
    gradVars += `--grad-${grad.id}: ${grad.type}-gradient(${grad.angle || 135}deg, ${grad.colors.join(', ')});\n`;
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avant-Garde OS compiled Page</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&family=Instrument+Serif&display=swap" rel="stylesheet">
  <style>
    :root {
      --canvas-w: ${width}px;
      --canvas-h: ${height}px;
      ${gradVars}
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow-x: hidden;
      font-family: 'Outfit', sans-serif;
    }
    
    /* Responsive Canvas Container mimicking Figma absolute mapping */
    .canvas-viewport {
      position: relative;
      width: 100vw;
      height: calc(100vw * (${height} / ${width}));
      max-width: ${width}px;
      max-height: ${height}px;
      background: ${bg};
      box-shadow: 0 50px 100px rgba(0,0,0,0.8);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.05);
    }
    
    /* Element layers */
    ${layerCss}
    
    /* Interactive grid lines helper */
    .canvas-grid {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: calc(8px / ${width} * 100%) calc(8px / ${height} * 100%);
      background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
      z-index: 99999;
      pointer-events: none;
    }
    
    .canvas-viewport.show-grid .canvas-grid {
      display: block;
    }
  </style>
</head>
<body>
  <div class="canvas-viewport" id="viewport">
    <div class="canvas-grid"></div>
${elementsHtml}  </div>
  
  <script>
    // Responsive helper to maintain canvas ratio
    function adjustScale() {
      const vp = document.getElementById('viewport');
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w >= ${width}) {
        vp.style.width = '${width}px';
        vp.style.height = '${height}px';
      } else {
        vp.style.width = '100vw';
        vp.style.height = 'calc(100vw * (${height} / ${width}))';
      }
    }
    window.addEventListener('resize', adjustScale);
    adjustScale();
  </script>
</body>
</html>`;

  ensureDirs();
  fs.writeFileSync(OUTPUT_HTML, fullHtml, 'utf8');
  return OUTPUT_HTML;
}

// Generate terminal ASCII or ANSI representation
function renderTerminalVision(state, type = 'color') {
  const { width, height, bg } = state.canvas;
  const cols = 80;
  const rows = 24;

  const buffer = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(hexToRgb(bg));
    }
    buffer.push(row);
  }

  // Plot each layer onto the terminal downscaled grid (top layer wins)
  state.layers.forEach((layer) => {
    const lx = layer.x;
    const ly = layer.y;
    const lw = layer.w;
    const lh = layer.h;

    // Convert canvas positions to 80x24 cells
    const startC = Math.max(0, Math.floor((lx / width) * cols));
    const endC = Math.min(cols, Math.floor(((lx + lw) / width) * cols));
    const startR = Math.max(0, Math.floor((ly / height) * rows));
    const endR = Math.min(rows, Math.floor(((ly + lh) / height) * rows));

    // Resolve color
    let fillRgb = hexToRgb('#1f2833');
    if (layer.fill && layer.fill.startsWith('#')) {
      fillRgb = hexToRgb(layer.fill);
    } else if (layer.color && layer.color.startsWith('#')) {
      fillRgb = hexToRgb(layer.color);
    } else if (layer.fill && layer.fill.startsWith('url(#')) {
      // Find gradient and pick average color
      const gradId = layer.fill.slice(5, -1);
      const grad = state.gradients.find(g => g.id === gradId);
      if (grad && grad.colors.length > 0) {
        fillRgb = hexToRgb(grad.colors[0]); // first stop
      }
    }

    for (let r = startR; r < endR; r++) {
      for (let c = startC; c < endC; c++) {
        buffer[r][c] = fillRgb;
      }
    }
  });

  // Synthesize Visual Streams
  if (type === 'ascii') {
    // Map luminance to brightness character map
    const charMap = ' .:-=+*#%@';
    let output = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = buffer[r][c];
        const lum = getLuminance(cell.r, cell.g, cell.b);
        const idx = Math.min(charMap.length - 1, Math.floor(lum * charMap.length));
        output += charMap[idx];
      }
      output += '\n';
    }
    return output;
  } else if (type === 'color') {
    // ANSI Block Grid
    let output = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = buffer[r][c];
        // Use truecolor background escapes with double space for block pixels
        output += `\x1b[48;2;${cell.r};${cell.g};${cell.b}m  `;
      }
      output += '\x1b[0m\n'; // reset color each row
    }
    return output;
  } else {
    // Inspect DOM Tree
    const elementsList = state.layers.map((layer, idx) => {
      const parentBg = state.canvas.bg;
      let textContrast = 'N/A';
      if (layer.type === 'text') {
        textContrast = `${calcAPCA(layer.color || '#fff', parentBg)} APCA`;
      }
      return {
        id: layer.name || `${layer.type}-${idx}`,
        type: layer.type,
        box: { top: layer.y, left: layer.x, width: layer.w, height: layer.h },
        fill: layer.fill || layer.color || '#fff',
        contrast: textContrast,
        interactive: !!layer.interactive
      };
    });
    return JSON.stringify({
      canvas: state.canvas,
      elementCount: state.layers.length,
      centroid: { x: Math.round(width / 2), y: Math.round(height / 2) },
      elements: elementsList
    }, null, 2);
  }
}

// Programmatic audits & test suites
function runAudits(state) {
  const reports = [];
  let score = 100;

  // Audit 1: Grid alignment check (8px grid standard)
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

  // Audit 2: Interactive Fitts's Target Sizes
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

  // Audit 3: APCA typography contrast check
  state.layers.forEach((layer, idx) => {
    if (layer.type === 'text') {
      const parentBg = state.canvas.bg;
      const contrast = calcAPCA(layer.color || '#ffffff', parentBg);
      const isHeader = (layer.size || 24) >= 32;
      const requiredContrast = isHeader ? 60 : 75; // standard APCA scale thresholds

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

  // Audit 4: Element Overlap collisions inside the same Z-index
  for (let i = 0; i < state.layers.length; i++) {
    for (let j = i + 1; j < state.layers.length; j++) {
      const a = state.layers[i];
      const b = state.layers[j];
      if (a.zIndex === b.zIndex) {
        // Simple overlapping bounding box validation
        const overlapX = a.x < b.x + b.w && a.x + a.w > b.x;
        const overlapY = a.y < b.y + b.h && a.y + a.h > b.y;
        if (overlapX && overlapY && a.type === b.type) {
          score -= 5;
          reports.push({
            type: 'Z_INDEX_COLLISION',
            severity: 'medium',
            message: `Elements [${a.name || i}] and [${b.name || j}] collide on identical Z-index layer: ${a.zIndex || 10}. Consider isolating layers.`
          });
        }
      }
    }
  }

  return {
    testSuite: 'Avant-Garde OS Visual Auditor',
    score: Math.max(0, score),
    status: score >= 90 ? 'PASS' : score >= 75 ? 'WARNING' : 'FAIL',
    timestamp: new Date().toISOString(),
    logs: reports
  };
}

// OS Command Coordinator Main shell
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(`
========================================================================
   AVANT-GARDE NATIVE HEADLESS DESIGN OS CLI COMMAND TOOL (vg-os)
========================================================================

Usage:
  node cli.js <command> [options]

Commands:
  init                     Setup a new virtual canvas design state
  draw <shape>             Add a vector layer to the design state
  gradient                 Add a gradient paint color palette
  compile                  Compile vector designs to a responsive web page
  vision                   Output layout maps, color previews, or inspect trees
  search                   Query design elements, underrated fonts, and images
  test                     Run the automated spatial layouts & APCA audits
  serve                    Launch the interactive bento diagnostics dashboard

Options:
  --width <px>             Set canvas layout width (default: 1280)
  --height <px>            Set canvas layout height (default: 800)
  --bg <color>             Canvas hex fill color (default: #0b0c10)
  --name <str>             Rename layers
  --x <px>, --y <px>       Absolute position coordinates
  --w <px>, --h <px>       Layout dimension sizes
  --fill <color>           Background fill colors
  --radius <px>            Border radius values (for cards)
  --blur <px>              Backdrop blur effects
  --content <txt>          Typography text content
  --font <str>             Specify Google fonts
  --size <px>              Text typography size
  --weight <num>           Text font weighting
  --color <hex>            Text fill colors
  --interactive            Indicate clickable element (Fitts's targets)
  --type <ascii|color|inspect> (For vision outputs)
  `);
    return;
  }

  // Parse custom parameters
  const params = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      params[key] = val;
    }
  }

  const state = loadState();

  switch (cmd) {
    case 'init':
      const initW = parseInt(params.width, 10) || 1280;
      const initH = parseInt(params.height, 10) || 800;
      const initBg = params.bg || '#0b0c10';
      
      const newState = {
        canvas: { width: initW, height: initH, bg: initBg, grid: 8 },
        gradients: [],
        layers: []
      };
      saveState(newState);
      console.log(`Initialized virtual canvas layout: ${initW}x${initH} | Fill: ${initBg}`);
      break;

    case 'gradient':
      const gradId = params.id;
      const gradColors = params.colors ? params.colors.split(',') : [];
      if (!gradId || gradColors.length === 0) {
        console.error('Error: Both --id and --colors (comma separated) are required.');
        process.exit(1);
      }
      state.gradients = state.gradients.filter(g => g.id !== gradId);
      state.gradients.push({
        id: gradId,
        type: params.type || 'linear',
        angle: parseInt(params.angle, 10) || 135,
        colors: gradColors
      });
      saveState(state);
      console.log(`Gradient paint [${gradId}] added to OS palette library.`);
      break;

    case 'draw':
      const shapeType = args[1];
      if (!['rect', 'circle', 'text'].includes(shapeType)) {
        console.error('Error: Specify a valid vector shape format: rect, circle, or text.');
        process.exit(1);
      }
      const newLayer = {
        type: shapeType,
        name: params.name || `${shapeType}-${state.layers.length}`,
        x: parseInt(params.x, 10) || 0,
        y: parseInt(params.y, 10) || 0,
        w: parseInt(params.w, 10) || 100,
        h: parseInt(params.h, 10) || 100,
        zIndex: parseInt(params.zIndex, 10) || (state.layers.length + 1) * 10,
        interactive: !!params.interactive
      };

      if (shapeType === 'rect') {
        newLayer.fill = params.fill || '#1f2833';
        if (params.radius) newLayer.radius = parseInt(params.radius, 10);
        if (params.blur) newLayer.blur = parseInt(params.blur, 10);
      } else if (shapeType === 'circle') {
        newLayer.fill = params.fill || '#ff3366';
      } else if (shapeType === 'text') {
        newLayer.content = params.content || 'Sample Typography';
        newLayer.font = params.font || 'Outfit';
        newLayer.size = parseInt(params.size, 10) || 24;
        newLayer.weight = parseInt(params.weight, 10) || 400;
        newLayer.color = params.color || '#ffffff';
        newLayer.align = params.align || 'left';
      }

      state.layers.push(newLayer);
      saveState(state);
      console.log(`Vector layer [${newLayer.name}] added to canvas state.`);
      break;

    case 'compile':
      const compiledPath = compileCanvas(state);
      console.log(`Compiled responsive vector canvas layout successfully:`);
      console.log(`📁 File written: ${compiledPath}`);
      break;

    case 'vision':
      const visionType = params.type || 'color';
      const output = renderTerminalVision(state, visionType);
      console.log(output);
      break;

    case 'test':
      const auditResult = runAudits(state);
      console.log('\n=============================================================');
      console.log('🤖 AVANT-GARDE SPATIAL AUDITOR AND AUTO-TEST RUNNER');
      console.log(`Status: ${auditResult.status} | Score: ${auditResult.score}/100`);
      console.log('=============================================================\n');
      if (auditResult.logs.length === 0) {
        console.log('✅ Standard compliant! Zero layout or APCA contrast violations.');
      } else {
        auditResult.logs.forEach(log => {
          const prefix = log.severity === 'high' ? '❌' : '⚠️';
          console.log(`${prefix} [${log.type}] ${log.message}`);
        });
      }
      console.log('');
      break;

    case 'search':
      const searchType = args[1];
      const searchQ = params.query || '';
      if (!['elements', 'fonts', 'images'].includes(searchType)) {
        console.error('Error: Specify a valid category: elements, fonts, or images.');
        process.exit(1);
      }
      // Delegate to existing utility node scripts
      const searchScript = path.join(process.cwd(), 'skills', 'utils', 'search.js');
      const searchArgs = [`--${searchType}`, searchQ];
      
      console.log(`Querying asset libraries: ${searchType} "${searchQ}"...`);
      const child = spawn('node', [searchScript, ...searchArgs], { stdio: 'inherit' });
      break;

    case 'serve':
      const serverScript = path.join(__dirname, 'server.js');
      console.log(`Launching visual server: node ${serverScript}...`);
      spawn('node', [serverScript], { stdio: 'inherit' });
      break;

    case 'agent':
      const subCmd = args[1];
      if (subCmd === 'list') {
        const tasks = orchestrator.loadTasks();
        console.log('\n=============================================================');
        console.log('🤖 AVANT-GARDE COGNITIVE SUBAGENT MESH - ACTIVE QUEUE');
        console.log('=============================================================\n');
        if (tasks.length === 0) {
          console.log('🏜️ No active or pending tasks in queue.');
        } else {
          tasks.forEach(t => {
            const icon = t.status === 'ACTIVE' ? '⚡' : '✅';
            console.log(`${icon} [${t.status}] Role: ${t.role.toUpperCase()} | Task: ${t.task}`);
            console.log(`   Handoff File: ${t.handoffPath}`);
            if (t.completed) console.log(`   Completed: ${t.completed}`);
          });
        }
        console.log('');
      } else if (subCmd === 'handoff') {
        const role = params.role;
        const task = params.task;
        if (!role || !task) {
          console.error('Error: Both --role <researcher|designer|auditor> and --task "<description>" are required.');
          process.exit(1);
        }
        const { taskId, handoffPath } = orchestrator.createHandoff(role, task);
        console.log(`\n=============================================================`);
        console.log(`⚡ COGNITIVE HANDOFF GENESIS - TASK "${taskId}" STARTED`);
        console.log(`=============================================================\n`);
        console.log(`📂 Styled handoff markdown folder generated successfully!`);
        console.log(`📁 File Location: ${handoffPath}`);
        console.log(`\n*Instruct the running agent to read this file, shift its persona, resolve the task, and stage output.*`);
        console.log('');
      } else if (subCmd === 'complete') {
        const role = params.role;
        const outText = params.output || '';
        if (!role) {
          console.error('Error: --role <researcher|designer|auditor> is required.');
          process.exit(1);
        }
        const result = orchestrator.completeHandoff(role, outText);
        console.log(`\n=============================================================`);
        console.log(`✅ SUBAGENT WORK INTEGRATED - ROLE "${role.toUpperCase()}"`);
        console.log(`=============================================================\n`);
        console.log(`Extracted Deliverables:\n`);
        console.log(result.deliverables);
        console.log(`\nTask status updated to COMPLETED. Memory buffers cleared!`);
        console.log('');
      } else {
        console.error('Error: Unknown agent command. Supported: list, handoff, complete.');
        process.exit(1);
      }
      break;

    default:
      console.error(`Error: Unknown command "${cmd}". Run "node cli.js --help" for options.`);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}
