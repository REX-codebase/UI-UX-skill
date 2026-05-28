#!/usr/bin/env node

/**
 * Avant-Garde UI-UX Native Headless Screenshot & Visual Feedback Engine
 * Zero-dependency headless page capture tool utilizing local Chrome or Microsoft Edge installations.
 * Provides real-time visual feedback of designed pages directly to terminal-based and non-multimodal AI agents.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Standard Windows paths for Google Chrome and Microsoft Edge executables
const BROWSER_PATHS = [
  // Chrome Locations
  path.join('C:', 'Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join('C:', 'Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  
  // Edge Locations
  path.join('C:', 'Program Files (x86)', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join('C:', 'Program Files', 'Microsoft', 'Edge', 'Application', 'msedge.exe')
];

// Scan Windows file system to find a valid headless browser executable path
function findBrowserPath() {
  for (const bp of BROWSER_PATHS) {
    if (fs.existsSync(bp)) return bp;
  }
  return null;
}

// Launches headless browser child process to capture visual screenshot
function captureHeadless(browserPath, targetUrl, outputPath, width = 1280, height = 800) {
  return new Promise((resolve, reject) => {
    const tempProfileDir = path.join(path.dirname(outputPath), '.chrome-profile');
    try {
      if (!fs.existsSync(tempProfileDir)) {
        fs.mkdirSync(tempProfileDir, { recursive: true });
      }
    } catch (e) {
      // fallback if permission issues, though local workspace should be writable
    }

    // Standard Chromium headless screenshot parameters
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--window-position=-2400,-2400',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-gpu-compositing',
      '--disable-gpu-sandbox',
      '--disable-accelerated-2d-canvas',
      '--use-gl=disabled',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--hide-scrollbars',
      `--user-data-dir=${tempProfileDir}`,
      '--remote-debugging-port=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--no-first-run',
      `--window-size=${width},${height}`,
      `--screenshot=${outputPath}`,
      targetUrl
    ];

    const child = spawn(browserPath, args, { stdio: 'ignore' });

    // Active polling to check if the screenshot file is written, allowing instant exit
    let resolved = false;
    const pollInterval = setInterval(() => {
      if (fs.existsSync(outputPath)) {
        try {
          const stats = fs.statSync(outputPath);
          if (stats.size > 0) {
            clearInterval(pollInterval);
            resolved = true;
            child.kill(); // clean up and terminate browser
            resolve(outputPath);
          }
        } catch (e) {
          // stats read could fail if file is locked during write, ignore and try next tick
        }
      }
    }, 100);

    child.on('close', (code) => {
      clearInterval(pollInterval);
      if (resolved) return;
      if (fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(new Error(`Headless process closed with exit code ${code} without writing file.`));
      }
    });

    // Enforce 15-second timeout safeguard to prevent hanging
    setTimeout(() => {
      clearInterval(pollInterval);
      if (resolved) return;
      child.kill();
      reject(new Error('Headless browser screenshot capture timed out (15s limit reached).'));
    }, 15000);
  });
}

// Help manual
function printHelp() {
  console.log(`
========================================================================
   AVANT-GARDE UI-UX SKILL - NATIVE HEADLESS SCREENSHOT ENGINE v2.0
========================================================================

Capture pixel-perfect snapshots of local HTML designs or web URLs.
Provides terminal-based vision feedback loops to text-only AI agents.

Usage:
  node screenshot.js --url <target> --output <filepath> [options]

Required Options:
  --url <target>       A web address or absolute path to a local HTML file
  --output <filepath>  Destination file path for the captured PNG screenshot

Optional Options:
  --view               Decode and visualize the captured screenshot live in the terminal
  --width <pixels>     Headless browser width in pixels (default: 1280)
  --height <pixels>    Headless browser height in pixels (default: 800)
  --help               Display this manual

Examples:
  node screenshot.js --url "http://localhost:3000" --output "./explorer.png" --view
  node screenshot.js --url "c:\\Users\\hp1\\Desktop\\UI-UX-skill\\skills\\explorer\\index.html" --output "./local.png"
  `);
}

// Dynamic execution coordinator
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // Parse arguments
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      params[key] = val;
    }
  }

  let { url: targetUrl, output: outFilePath, view: shouldView, width, height } = params;

  if (!targetUrl || !outFilePath) {
    console.error('Error: Both --url and --output are required parameters.');
    printHelp();
    process.exit(1);
  }

  // Resolve target source coordinates
  let finalUrl = targetUrl;
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    const resolvedPath = path.resolve(targetUrl);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: Local HTML source file not found at: ${resolvedPath}`);
      process.exit(1);
    }
    // Convert local filepath to correct file:// URI
    finalUrl = `file:///${resolvedPath.replace(/\\/g, '/')}`;
  }

  // Scan for Google Chrome or Microsoft Edge
  const browserPath = findBrowserPath();
  if (!browserPath) {
    console.error('\n[Screenshot Engine Error] Google Chrome or Microsoft Edge could not be located in standard Windows directories.');
    console.error('Please install Chrome or Edge to run headless screenshot captures.\n');
    process.exit(1);
  }

  const finalWidth = parseInt(width, 10) || 1280;
  const finalHeight = parseInt(height, 10) || 800;
  const resolvedOutPath = path.resolve(outFilePath);

  console.log(`\n=============================================================`);
  console.log(`📸 HEADLESS BROWSER NATIVE VISUAL CAPTURE ENGINE`);
  console.log(`🌐 Source: "${finalUrl}"`);
  console.log(`🖥️  Viewport: ${finalWidth}x${finalHeight} | Engine: ${path.basename(browserPath)}`);
  console.log(`=============================================================\n`);

  console.log('Spawning headless browser capture...');

  try {
    const savedPath = await captureHeadless(browserPath, finalUrl, resolvedOutPath, finalWidth, finalHeight);
    console.log(`\n=============================================================`);
    console.log(`🚀 SCREENSHOT SUCCESSFUL`);
    console.log(`📁 Captured PNG saved to: ${savedPath}`);
    console.log(`=============================================================\n`);

    if (!shouldView) return;

    // --- Dynamic visual decoder link ---
    console.log('Decoding captured screenshot PNG to terminal visual layout...');
    const screenshotBuffer = fs.readFileSync(savedPath);
    
    // Un-filter and downscale the screenshot image buffer dynamically using image-analyzer
    const { parsePNG, analyzeAndVisualize } = require('./image-analyzer');
    
    // We downscale to 24x18 for rendering high-fidelity bento elements inside terminal windows
    // To do this, we can write a tiny quick-resize scaling helper!
    const pngInfo = parsePNG(screenshotBuffer);
    
    const scaleWidth = 24;
    const scaleHeight = 18;
    const resizedPixels = [];
    
    for (let y = 0; y < scaleHeight; y++) {
      const row = [];
      const srcY = Math.floor((y / scaleHeight) * pngInfo.height);
      for (let x = 0; x < scaleWidth; x++) {
        const srcX = Math.floor((x / scaleWidth) * pngInfo.width);
        row.push(pngInfo.pixels[srcY][srcX]);
      }
      resizedPixels.push(row);
    }

    const scaledPngInfo = {
      width: scaleWidth,
      height: scaleHeight,
      pixels: resizedPixels
    };

    const analysis = analyzeAndVisualize(scaledPngInfo);

    console.log('\n--- TERMINAL TRUECOLOR VISUAL DISPLAY ---');
    console.log(analysis.ansiGrid);
    
    console.log('--- TEXT-ONLY LUMINANCE BLUEPRINT MAP (For non-multimodal AI) ---');
    console.log(analysis.asciiGrid);
    
    console.log('--- SEMANTIC ANALYSIS REPORT ---');
    console.log(`- Average Luminance: ${analysis.avgLuminance}% (Luminance scale: 0% dark -> 100% bright)`);
    console.log(`- Visual Weight Center: ${analysis.verticalFocus} - ${analysis.horizontalFocus}`);
    console.log(`- Dominant Color Palette (Top 3):`);
    analysis.sortedColors.forEach((color, i) => {
      console.log(`  [${i + 1}] RGB: ${color.rgb} | HSL: ${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}% | OKLCH Token: ${color.oklch}`);
    });
    console.log('\n*Visual Verification Loop Complete. Review the layout map above for correctness!*');

  } catch (err) {
    console.error(`\n[Screenshot Capture Failure] Visual feedback loop aborted: ${err.message}`);
    process.exit(1);
  }
}

// Export module for programmatic loading
module.exports = {
  captureScreenshot: async (options = {}) => {
    const { url, output, width = 1280, height = 800 } = options;
    if (!url || !output) throw new Error('Both url and output parameters are required.');
    
    const browserPath = findBrowserPath();
    if (!browserPath) throw new Error('Google Chrome or Microsoft Edge not found in standard directories.');
    
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `file:///${path.resolve(url).replace(/\\/g, '/')}`;
    }
    
    return captureHeadless(browserPath, finalUrl, path.resolve(output), width, height);
  }
};

if (require.main === module) {
  main();
}
