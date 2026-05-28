#!/usr/bin/env node

/**
 * Avant-Garde UI-UX Precise SVG Logo Generation Engine
 * Zero-dependency mathematical vector logo generator.
 * Provides production-ready, highly aesthetic SVG brand marks for AI coding agents and developers.
 */

const fs = require('fs');
const path = require('path');

// Core SVG Layout templates and coordinates calculators
const SVG_GENERATOR = {
  /**
   * Style 1: Bento & Geometric
   * Clean concentric meshes, overlapping glass shapes, and glowing OKLCH radial gradients.
   */
  bento: (name, primary, accent) => {
    const cleanName = name.toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <!-- Glowing OKLCH radial gradients -->
    <radialGradient id="bento-glow-primary" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bento-glow-accent" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bento-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.12)"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)"/>
    </linearGradient>
    <!-- Variable glass blur (Glassmorphism 2.0) -->
    <filter id="bento-glass-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Dark Mode Background Layer -->
  <rect width="100%" height="100%" fill="#0a0d16" rx="40"/>
  
  <!-- Background Glow Nodes -->
  <circle cx="200" cy="180" r="180" fill="url(#bento-glow-primary)"/>
  <circle cx="320" cy="280" r="160" fill="url(#bento-glow-accent)"/>
  
  <!-- Active Concentric Vector Mesh -->
  <g stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" fill="none">
    <circle cx="250" cy="220" r="140"/>
    <circle cx="250" cy="220" r="110"/>
    <circle cx="250" cy="220" r="80"/>
    <circle cx="250" cy="220" r="50"/>
    <line x1="250" y1="50" x2="250" y2="390"/>
    <line x1="80" y1="220" x2="420" y2="220"/>
    <line x1="130" y1="100" x2="370" y2="340"/>
    <line x1="130" y1="340" x2="370" y2="100"/>
  </g>

  <!-- Overlapping Glass Bento Shield (Bento Grid 2.0 squircle) -->
  <rect x="160" y="130" width="180" height="180" rx="36" 
        fill="url(#bento-shield-grad)" 
        stroke="rgba(255, 255, 255, 0.15)" 
        stroke-width="1.5"
        filter="url(#bento-glass-blur)"
        transform="rotate(15, 250, 220)"/>
        
  <!-- Glowing core badge -->
  <circle cx="250" cy="220" r="18" fill="${accent}" filter="drop-shadow(0 0 10px ${accent})"/>
  <circle cx="250" cy="220" r="8" fill="#ffffff"/>

  <!-- Precise Typography Wordmark -->
  <text x="250" y="420" text-anchor="middle" 
        fill="#ffffff" 
        font-family="'Space Grotesk', sans-serif" 
        font-weight="700" 
        font-size="28" 
        letter-spacing="0.25em">${cleanName}</text>
  <text x="250" y="445" text-anchor="middle" 
        fill="rgba(255, 255, 255, 0.4)" 
        font-family="'Outfit', sans-serif" 
        font-size="11" 
        letter-spacing="0.4em" 
        font-weight="500">ACTIVE GRID TECHNOLOGY</text>
</svg>`;
  },

  /**
   * Style 2: Organic & Handcrafted
   * Displacement filters for ink bleed / hand tremors, paper texture background overlays.
   */
  organic: (name, primary, accent) => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <!-- Organic Wobble Displacement Filter -->
    <filter id="organic-wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- Paper Grain Texture Layer -->
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.03 0" in="noise" result="coloredNoise"/>
      <feComposite operator="in" in2="SourceGraphic" result="monoNoise"/>
      <feBlend mode="multiply" in="SourceGraphic" in2="monoNoise"/>
    </filter>
  </defs>
  
  <!-- Raw Handmade Paper Background -->
  <rect width="100%" height="100%" fill="#f4f1eb" filter="url(#paper-texture)"/>
  
  <g filter="url(#organic-wobble)">
    <!-- Hand-painted watercolor concentric washes -->
    <path d="M 250,90 A 130,130 0 0,1 380,220 A 130,130 0 0,1 250,350 A 130,130 0 0,1 120,220 A 130,130 0 0,1 250,90 Z" 
          fill="none" stroke="${primary}" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
          
    <path d="M 250,130 A 90,90 0 0,1 340,220 A 90,90 0 0,1 250,310 A 90,90 0 0,1 160,220 A 90,90 0 0,1 250,130 Z" 
          fill="none" stroke="${accent}" stroke-width="5" stroke-dasharray="10 15 25 10" opacity="0.9"/>

    <!-- Hand-drawn central organic botanical leaf silhouette -->
    <path d="M 250,280 C 230,260 215,220 215,190 C 215,170 230,150 250,170 C 270,150 285,170 285,190 C 285,220 270,260 250,280 Z
             M 250,170 L 250,280" 
          fill="${primary}" opacity="0.85"/>
          
    <path d="M 250,230 C 265,220 275,200 275,195" fill="none" stroke="#f4f1eb" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 250,210 C 235,200 225,180 225,175" fill="none" stroke="#f4f1eb" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  
  <!-- Handwritten Styled Typography -->
  <text x="250" y="420" text-anchor="middle" 
        fill="${primary}" 
        font-family="'Instrument Serif', serif" 
        font-style="italic" 
        font-size="40" 
        filter="url(#organic-wobble)">${name}</text>
  <text x="250" y="450" text-anchor="middle" 
        fill="rgba(26, 32, 44, 0.5)" 
        font-family="'Outfit', sans-serif" 
        font-size="9" 
        letter-spacing="0.3em" 
        font-weight="600">HAND-CRAFTED MINDFULNESS</text>
</svg>`;
  },

  /**
   * Style 3: Brutalist & Technical
   * Precise 3D isometric cube wireframe, coordinate ticks, crosshairs, raw industrial lines.
   */
  brutalist: (name, primary, accent) => {
    const cleanName = name.toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <!-- Brutalist Raw Blueprint Background -->
  <rect width="100%" height="100%" fill="#0c0e14"/>
  
  <!-- Technical blueprint background grid -->
  <g stroke="rgba(255, 255, 255, 0.02)" stroke-width="1">
    <line x1="50" y1="0" x2="50" y2="500"/>
    <line x1="100" y1="0" x2="100" y2="500"/>
    <line x1="150" y1="0" x2="150" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="500"/>
    <line x1="250" y1="0" x2="250" y2="500"/>
    <line x1="300" y1="0" x2="300" y2="500"/>
    <line x1="350" y1="0" x2="350" y2="500"/>
    <line x1="400" y1="0" x2="400" y2="500"/>
    <line x1="450" y1="0" x2="450" y2="500"/>
    
    <line x1="0" y1="50" x2="500" y2="500"/>
    <line x1="0" y1="100" x2="500" y2="100"/>
    <line x1="0" y1="150" x2="500" y2="150"/>
    <line x1="0" y1="200" x2="500" y2="200"/>
    <line x1="0" y1="250" x2="500" y2="250"/>
    <line x1="0" y1="300" x2="500" y2="300"/>
    <line x1="0" y1="350" x2="500" y2="350"/>
    <line x1="0" y1="400" x2="500" y2="400"/>
    <line x1="0" y1="450" x2="500" y2="450"/>
  </g>

  <!-- Circular Radar Blueprint Rings -->
  <g stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" fill="none">
    <circle cx="250" cy="200" r="120"/>
    <circle cx="250" cy="200" r="90"/>
    <circle cx="250" cy="200" r="60"/>
    <!-- Outer tick marks -->
    <path d="M 250,60 L 250,70 M 250,330 L 250,340 M 110,200 L 120,200 M 380,200 L 390,200" stroke="${accent}" stroke-width="2"/>
  </g>

  <!-- Mathematically Calculated 3D Isometric Wireframe Cube -->
  <g stroke="#ffffff" stroke-width="1.5" fill="none">
    <!-- Top Face -->
    <polygon points="250,110 320,150 250,190 180,150" fill="rgba(255, 255, 255, 0.02)"/>
    <!-- Left Face -->
    <polygon points="180,150 250,190 250,270 180,230" fill="rgba(255, 255, 255, 0.04)"/>
    <!-- Right Face -->
    <polygon points="250,190 320,150 320,230 250,270" fill="rgba(255, 255, 255, 0.06)"/>
    
    <!-- Accent Core Vectors -->
    <line x1="250" y1="190" x2="250" y2="270" stroke="${accent}" stroke-width="2.5"/>
    <line x1="250" y1="190" x2="180" y2="150" stroke="${accent}" stroke-width="2.5"/>
    <line x1="250" y1="190" x2="320" y2="150" stroke="${accent}" stroke-width="2.5"/>
  </g>
  
  <!-- Technical blueprint crosshair ticks -->
  <g stroke="${accent}" stroke-width="1">
    <line x1="250" y1="180" x2="250" y2="200"/>
    <line x1="240" y1="190" x2="260" y2="190"/>
  </g>

  <!-- Brutalist Monospace Industrial Wordmark -->
  <g font-family="'Space Grotesk', monospace" fill="#ffffff" font-weight="700">
    <text x="250" y="415" text-anchor="middle" font-size="30" letter-spacing="0.3em">${cleanName}</text>
    <text x="250" y="445" text-anchor="middle" font-size="10" letter-spacing="0.5em" fill="${accent}" font-weight="500">SYS_COORDINATES // v2.0</text>
  </g>
</svg>`;
  },

  /**
   * Style 4: Cinematic Wordmark
   * Elegant typographic portals, infinite vectors loops, clean luxury branding aesthetics.
   */
  cinematic: (name, primary, accent) => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <!-- Elegant Linear Gradient portals -->
    <linearGradient id="cine-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <linearGradient id="cine-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${primary}"/>
    </linearGradient>
    <filter id="cine-portal-glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Rich Dark Slate Background -->
  <rect width="100%" height="100%" fill="#08080c" rx="40"/>
  
  <!-- Concentric cinematic light rings -->
  <circle cx="250" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
  <circle cx="250" cy="200" r="130" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1.5"/>

  <!-- High-Precision Typographic Portal Loop (Infinite geometry) -->
  <g filter="url(#cine-portal-glow)" stroke-linecap="round">
    <!-- Infinite Portal Loop path -->
    <path d="M 200,200 C 140,140 140,260 200,200 C 260,140 340,260 290,200" 
          fill="none" stroke="url(#cine-grad-1)" stroke-width="10" stroke-linejoin="round"/>
    <path d="M 300,200 C 360,140 360,260 300,200 C 240,140 160,260 210,200" 
          fill="none" stroke="url(#cine-grad-2)" stroke-width="6" stroke-linejoin="round" opacity="0.8"/>
  </g>
  
  <!-- Portal light beads -->
  <circle cx="250" cy="200" r="4" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)"/>

  <!-- Cinematic Wordmark Typography -->
  <text x="250" y="415" text-anchor="middle" 
        fill="#ffffff" 
        font-family="'Instrument Serif', serif" 
        font-size="44" 
        letter-spacing="0.12em" 
        font-weight="300" 
        font-style="italic">${name}</text>
  <line x1="180" y1="435" x2="320" y2="435" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1"/>
  <text x="250" y="455" text-anchor="middle" 
        fill="rgba(255, 255, 255, 0.35)" 
        font-family="'Outfit', sans-serif" 
        font-size="9" 
        letter-spacing="0.5em" 
        font-weight="600">CINEMATIC CHOREOGRAPHY</text>
</svg>`;
  }
};

// Help menu documentation
function printHelp() {
  console.log(`
========================================================================
   AVANT-GARDE UI-UX Precise SVG Logo Generation Engine v2.0
========================================================================

Generate mathematically perfect vector brand marks and assets programmatically.

Usage:
  node svg-generator.js --type <type> --name <brand> [options]

Required Options:
  --type <type>        Generator Style: bento, organic, brutalist, cinematic
  --name <brand>       Text wordmark to bake into the SVG logo

Optional Options:
  --primary <color>    Primary accent color (OKLCH, HSL, or Hex; e.g. "oklch(0.65 0.16 300)" or "#6366f1")
  --accent <color>     Secondary accent color (e.g. "oklch(0.78 0.15 140)" or "#10b981")
  --output <filepath>  Directly output and save to specified vector file
  --help               Display this manual

Examples:
  node svg-generator.js --type bento --name "NovaTech" --output "./logo.svg"
  node svg-generator.js --type organic --name "Mindfulness" --primary "#1e3a8a" --accent "#10b981"
  node svg-generator.js --type brutalist --name "Sys_Control"
  `);
}

// Main execution block
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
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

  const { type, name, primary, accent, output } = params;

  if (!type || !name) {
    console.error('Error: Both --type and --name are required options to generate a logo.');
    printHelp();
    process.exit(1);
  }

  if (!SVG_GENERATOR[type]) {
    console.error(`Error: Invalid logo style type "${type}". Supported: bento, organic, brutalist, cinematic.`);
    process.exit(1);
  }

  // Default color palettes using Avant-Garde 2026 guidelines
  const defaultPrimary = type === 'organic' ? '#2d3748' : 'oklch(0.65 0.16 300)'; // Lavender-violet
  const defaultAccent = type === 'organic' ? '#38a169' : 'oklch(0.78 0.15 140)';  // Emerald green
  
  const finalPrimary = typeof primary === 'string' ? primary : defaultPrimary;
  const finalAccent = typeof accent === 'string' ? accent : defaultAccent;

  // Execute mathematical logo builder
  const svg = SVG_GENERATOR[type](name, finalPrimary, finalAccent);

  if (typeof output === 'string') {
    const outputPath = path.resolve(output);
    const parentDir = path.dirname(outputPath);
    
    // Create parent directories if missing
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, svg, 'utf8');
    console.log(`\n=============================================================`);
    console.log(`🚀 VECTOR LOGO GENERATION SUCCESSFUL`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`🎨 Style: ${type.toUpperCase()} | Brand Mark: "${name}"`);
    console.log(`=============================================================\n`);
  } else {
    // Print directly to stdout for agent pipelining
    console.log(svg);
  }
}

// Export module for Node programmatic loading
module.exports = {
  generateSVG: (options = {}) => {
    const { type, name, primary, accent } = options;
    if (!type || !name) {
      throw new Error('Both type and name are required options.');
    }
    if (!SVG_GENERATOR[type]) {
      throw new Error(`Invalid style type: ${type}`);
    }
    const defaultPrimary = type === 'organic' ? '#2d3748' : 'oklch(0.65 0.16 300)';
    const defaultAccent = type === 'organic' ? '#38a169' : 'oklch(0.78 0.15 140)';
    return SVG_GENERATOR[type](name, primary || defaultPrimary, accent || defaultAccent);
  }
};

if (require.main === module) {
  main();
}
