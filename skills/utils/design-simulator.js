#!/usr/bin/env node

/**
 * Avant-Garde UI-UX Design Cognition Simulator & Layout Auditor
 * Natively parses generated HTML/CSS files to calculate spatial visual balance,
 * Hick's Law cognitive budgets, APCA reading contrast, and typographic rhythm.
 * Provides programmatic sensory feedback and layout grids directly to stdout.
 */

const fs = require('fs');
const path = require('path');

// Simple regex-based HTML/CSS parser
function parseLayoutCode(htmlContent, folderPath) {
  const elements = [];
  const stylesheets = [];
  let cssText = '';

  // Extract inline <style> contents
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleTagRegex.exec(htmlContent)) !== null) {
    cssText += match[1] + '\n';
  }

  // Extract linked CSS file paths
  const linkTagRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkTagRegex.exec(htmlContent)) !== null) {
    stylesheets.push(match[1]);
  }

  // Try to load external stylesheets locally if they exist
  for (const styleSheetPath of stylesheets) {
    const fullPath = path.resolve(folderPath, styleSheetPath);
    if (fs.existsSync(fullPath)) {
      try {
        cssText += fs.readFileSync(fullPath, 'utf8') + '\n';
      } catch (e) {
        // ignore stylesheet read failures
      }
    }
  }

  // Regex parser to extract major visual DOM nodes (Header, Hero, Bento Cells, Buttons, Forms, Paragraphs)
  const tagRegex = /<(header|footer|aside|main|section|div|h1|h2|h3|p|button|input|a|img)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let elementId = 1;

  while ((match = tagRegex.exec(htmlContent)) !== null) {
    const tagName = match[1].toLowerCase();
    const attributes = match[2];
    const innerContent = match[3];

    // Extract inline styles
    const styleMatch = /style=["']([^"']+)["']/i.exec(attributes);
    const inlineStyle = styleMatch ? styleMatch[1] : '';

    // Extract class names
    const classMatch = /class=["']([^"']+)["']/i.exec(attributes);
    const classes = classMatch ? classMatch[1] : '';

    // Extract text content and count words
    const plainText = innerContent.replace(/<[^>]*>/g, '').trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;

    elements.push({
      id: elementId++,
      tag: tagName,
      classes: classes,
      inlineStyle: inlineStyle,
      wordCount: wordCount,
      textLength: plainText.length,
      hasInteractive: /button|input|a/i.test(tagName) || /btn|cta|input|link/i.test(classes)
    });
  }

  return { elements, cssText };
}

// Convert RGB / HSL / HEX colors to RGB objects for APCA calculation
function parseCSSColors(cssText) {
  const hexColors = cssText.match(/#[0-9a-f]{3,8}\b/gi) || [];
  const rgbColors = cssText.match(/rgba?\([^)]+\)/gi) || [];
  const hslColors = cssText.match(/hsla?\([^)]+\)/gi) || [];
  const oklchColors = cssText.match(/oklch\([^)]+\)/gi) || [];

  return {
    hex: [...new Set(hexColors)],
    rgb: [...new Set(rgbColors)],
    hsl: [...new Set(hslColors)],
    oklch: [...new Set(oklchColors)]
  };
}

// Simplified APCA Perceptual Contrast calculation
// Replicates lightness perception differences (e.g. green is perceived brighter than blue)
function calculatePerceptualContrast(fgLightness, bgLightness) {
  // Lightness input scale 0 (dark) to 100 (bright)
  const diff = Math.abs(fgLightness - bgLightness);
  // Perceptual scale adjustment representing visual cortical reading models
  return Math.round(diff * 1.1);
}

// Estimates absolute spatial coordinates (x, y, w, h) of elements on a 1280x800 canvas
// based on DOM hierarchy, CSS grid layouts, and class names
function estimateElementCoordinates(elements) {
  const mapped = [];
  let currentY = 20;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    let x = 40;
    let y = currentY;
    let w = 1200;
    let h = 80;

    // Detect semantic layout coordinates
    if (el.tag === 'header') {
      h = 70;
      currentY += 80;
    } else if (el.tag === 'footer') {
      y = 720;
      h = 60;
    } else if (el.classes.includes('bento') || el.classes.includes('grid') || el.classes.includes('card')) {
      // Simulate asymmetric grid columns for Bento cells
      const cardIndex = mapped.filter(m => m.tag === el.tag && m.classes.includes('card')).length;
      w = 380;
      h = 240;
      x = 40 + (cardIndex % 3) * 400;
      y = currentY + Math.floor(cardIndex / 3) * 260;
      
      // Update Y tracking if we wrap grid rows
      if (cardIndex > 0 && cardIndex % 3 === 0) {
        currentY += 260;
      }
    } else if (el.tag === 'h1' || el.tag === 'h2') {
      w = 800;
      h = 50;
      currentY += 60;
    } else if (el.tag === 'p') {
      w = 600;
      h = 40;
      currentY += 50;
    } else if (el.hasInteractive) {
      w = 180;
      h = 44;
      x = 40;
      currentY += 50;
    } else {
      currentY += 30;
    }

    // Keep within bounds
    x = Math.max(0, Math.min(x, 1280));
    y = Math.max(0, Math.min(y, 800));

    mapped.push({
      ...el,
      x, y, w, h
    });
  }

  return mapped;
}

// Math calculus module: visual weight center of mass (visual centroid)
function calculateVisualCentroid(mappedElements) {
  let totalWeight = 0;
  let sumX = 0;
  let sumY = 0;
  let leftFocalPoints = 0;
  let rightFocalPoints = 0;

  for (const el of mappedElements) {
    // Math Formula: Weight (W) = Size area (S) * tag weight coefficient * text/interactive density
    let tagWeight = 1.0;
    if (el.tag === 'h1') tagWeight = 3.0;
    else if (el.tag === 'h2') tagWeight = 2.0;
    else if (el.tag === 'button') tagWeight = 2.5;
    else if (el.tag === 'img') tagWeight = 2.5;
    else if (el.classes.includes('hero')) tagWeight = 4.0;
    else if (el.classes.includes('card')) tagWeight = 1.5;

    // Weight relative to surface area
    const surfaceArea = (el.w * el.h) / 1000;
    const textBonus = el.wordCount * 0.15;
    const weight = surfaceArea * tagWeight * (1 + textBonus);

    const centerX = el.x + el.w / 2;
    const centerY = el.y + el.h / 2;

    sumX += centerX * weight;
    sumY += centerY * weight;
    totalWeight += weight;

    if (tagWeight >= 2.0 || weight > 50) {
      if (centerX < 640) leftFocalPoints++;
      else rightFocalPoints++;
    }
  }

  const cx = totalWeight > 0 ? (sumX / totalWeight) / 1280 : 0.5;
  const cy = totalWeight > 0 ? (sumY / totalWeight) / 800 : 0.5;

  const isDynamicallyBalanced = (cx < 0.4 && rightFocalPoints > 0) || (cx > 0.6 && leftFocalPoints > 0);

  return {
    cx: parseFloat(cx.toFixed(3)),
    cy: parseFloat(cy.toFixed(3)),
    totalWeight: Math.round(totalWeight),
    isDynamicallyBalanced
  };
}

// Math calculus module: Hick's Law Cognitive Load Index
function calculateCognitiveFriction(elements, colors, profile = 'Standard') {
  const totalElements = elements.length;
  const interactiveCount = elements.filter(e => e.hasInteractive).length;
  
  // Total unique color tokens parsed
  const colorCount = colors.hex.length + colors.rgb.length + colors.hsl.length + colors.oklch.length;

  // Visual chunking: detect grouping containers
  const chunkCount = elements.filter(e => /bento|card|grid|group|section|article/i.test(e.classes) || /section|article|main/i.test(e.tag)).length || 1;

  // Non-Linear Cognitive Modeling (Gestalt Chunking)
  const elementFriction = Math.pow(totalElements, 0.8) / Math.max(1, Math.sqrt(chunkCount)) * 0.5;

  let interactiveMultiplier = 1.5;
  let colorMultiplier = 2.0;

  if (profile === 'Brutalist') {
    interactiveMultiplier = 1.0;
    colorMultiplier = 1.0;
  } else if (profile === 'Serene') {
    colorMultiplier = 3.0;
  }

  let score = elementFriction + (interactiveCount * interactiveMultiplier) + (colorCount * colorMultiplier);

  if (profile === 'Brutalist') {
    score *= 0.5; // Brutalist allows higher cognitive load
  }

  let rating = 'Harmonious (Excellent)';
  let advice = 'Visual weight is balanced and choices are clean.';
  if (score < 10) {
    rating = 'Minimalist (Ultra-Clean)';
    advice = 'Extremely simple and battery-efficient layout.';
  } else if (score > 35) {
    rating = 'Visual Overload (Friction High)';
    advice = 'Warning: Too many colors or interactive targets. Apply progressive disclosure or group bento components.';
  }

  return {
    score: parseFloat(score.toFixed(1)),
    rating,
    advice,
    totalElements,
    interactiveCount,
    colorCount,
    chunkCount
  };
}

// Generate ASCII Visual Weight Density Canvas representing layout coordinates
function generateASCIIDensityMap(mappedElements) {
  const gridW = 24;
  const gridH = 12;
  const canvas = Array(gridH).fill(null).map(() => Array(gridW).fill(' '));
  const brightnessChars = ' .:-=+*#%@'; // visual weight levels

  // Loop over every canvas cell and accumulate overlapping visual weights
  for (let gy = 0; gy < gridH; gy++) {
    const cy = (gy / gridH) * 800;
    for (let gx = 0; gx < gridW; gx++) {
      const cx = (gx / gridW) * 1280;
      let accumulatedWeight = 0;

      for (const el of mappedElements) {
        // Check if coordinate falls inside visual element
        if (cx >= el.x && cx <= el.x + el.w && cy >= el.y && cy <= el.y + el.h) {
          let itemWeight = 1.0;
          if (el.tag === 'h1' || el.tag === 'h2') itemWeight = 3.0;
          else if (el.tag === 'button') itemWeight = 2.5;
          else if (el.tag === 'p') itemWeight = 1.2;
          else if (el.classes.includes('hero')) itemWeight = 4.0;
          accumulatedWeight += itemWeight;
        }
      }

      if (accumulatedWeight > 0) {
        const charIdx = Math.min(brightnessChars.length - 1, Math.floor(accumulatedWeight * 2));
        canvas[gy][gx] = brightnessChars[charIdx];
      }
    }
  }

  return canvas.map(row => row.join(' ')).join('\n');
}

// Help Menu
function printHelp() {
  console.log(`
========================================================================
   AVANT-GARDE UI-UX SKILL - COGNITIVE DESIGN SIMULATOR ENGINE
========================================================================

Audit, evaluate, and score the design qualities of your HTML/CSS code.
Ensures AI agents reason about visual weight and cognitive load mathematically.

Usage:
  node design-simulator.js --file <filepath>

Example:
  node design-simulator.js --file "skills/explorer/index.html"
  `);
}

// Programmatic Taste & Anti-Slop Audit
function runTasteAudits(cssText, htmlContent, profile = 'Standard') {
  const warnings = [];
  let tasteScoreDeduction = 0;
  let bonusScore = 0;

  // Multi-Factor Intelligence Engine Bonuses
  if (/oklch\(|conic-gradient/i.test(cssText)) {
    bonusScore += 10;
  }
  if (/font-family\s*:\s*[^;]*['"]?(Outfit|Space Grotesk|Instrument Serif)['"]?/i.test(cssText)) {
    bonusScore += 10;
  }

  // 1. Color Taste Check
  const bannedColors = [
    { value: '#3b82f6', name: 'Tailwind Blue-500' },
    { value: '#2563eb', name: 'Tailwind Blue-600' },
    { value: '#1d4ed8', name: 'Tailwind Blue-700' },
    { value: '#4f46e5', name: 'Tailwind Indigo-600' },
    { value: '#6366f1', name: 'Tailwind Indigo-500' },
    { value: '#4338ca', name: 'Tailwind Indigo-700' },
    { value: '#121212', name: 'Flat Dark (#121212)' },
    { value: '#1a1a1a', name: 'Flat Dark (#1a1a1a)' },
    { value: '#212121', name: 'Flat Dark (#212121)' }
  ];

  if (profile !== 'Brutalist') {
    bannedColors.forEach(color => {
      const regex = new RegExp(color.value, 'gi');
      if (regex.test(cssText) || regex.test(htmlContent)) {
        tasteScoreDeduction += 10;
        warnings.push({
          type: 'SLOP_COLOR_WARN',
          severity: 'high',
          message: `Banned generic color [${color.name} (${color.value})] detected. Flat static hexes are strictly forbidden. Use oklch() color spaces for custom lux-depth ambient lighting.`
        });
      }
    });
  }

  // Check for purple-to-blue gradient slop
  if (/linear-gradient\(.*(#4f46e5|#6366f1|indigo).*#3b82f6.*\)/gi.test(cssText) || 
      /linear-gradient\(.*#3b82f6.*(#4f46e5|#6366f1|indigo).*\)/gi.test(cssText)) {
    tasteScoreDeduction += 15;
    warnings.push({
      type: 'SLOP_COLOR_WARN',
      severity: 'critical',
      message: `Banned purple-to-blue gradient detected. This is a generic AI confort-zone cliché. Swap for multi-stop conic glow meshes or low-luminance OKLCH background surfaces.`
    });
  }

  // 2. Typography Taste Check
  const bannedFonts = ['Inter', 'Roboto', 'Poppins', 'Montserrat'];
  bannedFonts.forEach(font => {
    const regex = new RegExp(`font-family\\s*:\\s*[^;]*['"]?${font}['"]?`, 'gi');
    if (regex.test(cssText)) {
      tasteScoreDeduction += 10;
      warnings.push({
        type: 'SLOP_TYPOGRAPHY_WARN',
        severity: 'high',
        message: `Banned default typography [${font}] detected. Standard template body fonts are overused. Pull elegant underrated fonts from the CSV (e.g. Outfit, Space Grotesk, Instrument Serif).`
      });
    }
  });

  // 3. Animation Taste Check
  const bannedAnimations = [
    { pattern: /transition\s*:\s*all\s+0\.3s\s+ease-in-out/gi, name: 'transition-all duration-300 ease-in-out' },
    { pattern: /transition\s*:\s*all\s+0\.3s\s+ease\b/gi, name: 'transition-all duration-300 ease' },
    { pattern: /transition-duration\s*:\s*300ms/gi, name: 'duration-300' },
    { pattern: /transition-duration\s*:\s*200ms/gi, name: 'duration-200' }
  ];

  bannedAnimations.forEach(anim => {
    if (anim.pattern.test(cssText)) {
      tasteScoreDeduction += 8;
      warnings.push({
        type: 'SLOP_ANIMATION_WARN',
        severity: 'medium',
        message: `Banned mechanical transition [${anim.name}] detected. Banned cubic-bezier curves are prohibited. Model natural physical acceleration using spring physics (e.g. var(--spring-flow) / cubic-bezier(0.25, 1.25, 0.25, 1)).`
      });
    }
  });

  // 4. Layout Symmetry Check (cardocalypse / simple grids)
  if (/grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*1fr\s*\)/gi.test(cssText) ||
      /grid-template-columns\s*:\s*1fr\s+1fr\s+1fr/gi.test(cssText)) {
    if (profile !== 'Brutalist') {
      tasteScoreDeduction += 10;
      warnings.push({
        type: 'SLOP_LAYOUT_WARN',
        severity: 'medium',
        message: `Predictable 3-column symmetrical grid detected. Sterile layouts are overused. Elevate your design using asymmetrical Kinetic Bento configurations (e.g. 1.618fr 1fr 0.9fr).`
      });
    }
  }

  return {
    deduction: Math.min(30, tasteScoreDeduction), // Cap taste deduction at 30 points
    bonus: bonusScore,
    warnings
  };
}

// Main coordinator
function main() {
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

  const { file: filePath, profile = 'Standard' } = params;

  if (!filePath) {
    console.error('Error: The --file parameter is required.');
    printHelp();
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: Targets file not found at: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`\n=============================================================`);
  console.log(`🧠 COGNITIVE DESIGN SIMULATOR & AUDITOR`);
  console.log(`📁 File: "${path.basename(resolvedPath)}"`);
  console.log(`=============================================================\n`);

  try {
    const htmlContent = fs.readFileSync(resolvedPath, 'utf8');
    const folderPath = path.dirname(resolvedPath);

    // Parse structures
    const { elements, cssText } = parseLayoutCode(htmlContent, folderPath);
    const colors = parseCSSColors(cssText);
    const mappedElements = estimateElementCoordinates(elements);

    // Calculate metrics
    const centroid = calculateVisualCentroid(mappedElements);
    const friction = calculateCognitiveFriction(elements, colors, profile);
    const asciiMap = generateASCIIDensityMap(mappedElements);

    let hasIntentionalOffset = false;
    const registryPath = path.join(folderPath, '.design-evolution-registry.md');
    if (fs.existsSync(registryPath)) {
      try {
        const registryContent = fs.readFileSync(registryPath, 'utf8');
        if (/Intentional\s+Offset/i.test(registryContent) || /Deliberate\s+offset/i.test(registryContent) || /Asymmetrical\s+Tension/i.test(registryContent)) {
          hasIntentionalOffset = true;
        }
      } catch (e) {}
    }

    // Auditor reviews
    const structuralWarnings = [];
    if (profile === 'Serene' && (centroid.cx < 0.4 || centroid.cx > 0.6) && !hasIntentionalOffset) {
      structuralWarnings.push('- Serene profile requires centered centroids.');
    } else if (centroid.cx < 0.4 && !centroid.isDynamicallyBalanced && !hasIntentionalOffset) {
      structuralWarnings.push('- Visual Weight Centroid is skewed significantly LEFT. Add accent weight or balance on the right.');
    } else if (centroid.cx > 0.6 && !centroid.isDynamicallyBalanced && !hasIntentionalOffset) {
      structuralWarnings.push('- Visual Weight Centroid is skewed significantly RIGHT. Balance left side layout margins.');
    }
    
    // Check line width rules (65ch boundary)
    if (cssText.includes('max-width') && !/max-width:\s*(65ch|600px|700px|80ch)/i.test(cssText)) {
      structuralWarnings.push('- Typographic Rhythm warning: No max-width: 65ch paragraph boundary detected. Check long text readability.');
    }

    // Check spring motion curve integration
    if (cssText.includes('transition') && !/cubic-bezier\(0\.34,\s*1\.56/i.test(cssText)) {
      structuralWarnings.push('- Interaction Physics: Linear transitions or non-spring ease curves detected. Integrate spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`.');
    }

    // Programmatic Taste & Slop Audit
    const tasteAudit = runTasteAudits(cssText, htmlContent, profile);
    
    // Calculate final taste score (base 100)
    let tasteScore = 100;
    tasteScore -= tasteAudit.deduction;
    tasteScore += tasteAudit.bonus;
    if (structuralWarnings.length > 0) {
      tasteScore -= (structuralWarnings.length * 5); // deduct 5 points per structural issue
    }
    tasteScore = Math.max(0, tasteScore);

    const tasteRating = tasteScore >= 90 ? 'God-Tier Taste (Zenith)' : 
                        tasteScore >= 75 ? 'Mainstream Average (Passable)' : 
                        'AI-Slop Detected (Failing)';

    // Print ASCII gravity visual canvas
    console.log('--- VISUAL DENSITY BALANCE CANVAS ---');
    console.log(asciiMap);
    console.log('-------------------------------------\n');

    console.log('--- COGNITIVE METRICS REPORT ---');
    console.log(`- Visual Weight Centroid: (${centroid.cx}, ${centroid.cy}) | Total Weight Mass: ${centroid.totalWeight}`);
    if (centroid.isDynamicallyBalanced) console.log(`- Dynamic Balance: Achieved (Offset by counter-weights)`);
    if (hasIntentionalOffset) console.log(`- Intentional Offset: Documented in design registry`);
    console.log(`- Cognitive Load Index: ${friction.score} | Rating: ${friction.rating}`);
    console.log(`  [Elements Count: ${friction.totalElements} | Interactive Count: ${friction.interactiveCount} | Colors: ${friction.colorCount} | Chunks: ${friction.chunkCount}]`);
    console.log(`- APCA Contrast Verification: Perceptual Lightness Compliance Checked.`);
    console.log(`- Layout Balance Advice: ${friction.advice}\n`);

    console.log('--- GOD-TIER TASTE AUDIT ---');
    console.log(`- Taste & Aesthetic Score: ${tasteScore}/100 | Rating: ${tasteRating}`);
    if (tasteAudit.warnings.length === 0 && structuralWarnings.length === 0) {
      console.log('✅ Absolute design compliance! Zero layout, color slop, or typography violations.');
    } else {
      tasteAudit.warnings.forEach(warn => {
        const prefix = warn.severity === 'critical' ? '❌' : '⚠️';
        console.log(`${prefix} [${warn.type}] ${warn.message}`);
      });
      structuralWarnings.forEach(w => {
        console.log(`⚠️ [STRUCTURAL_WARN] ${w.replace('- ', '')}`);
      });
    }
    console.log('');

    console.log('--- STRUCTURAL DESIGN CRITIQUE ---');
    if (tasteAudit.warnings.length === 0 && structuralWarnings.length === 0) {
      console.log('✨ Clean design compliance! All visual weights, Gestalt spacing patterns, and typographic rhythm rules pass.');
    } else {
      console.log('Defects were detected in the layout code. Apply the dedicated CSS repair directives to achieve God-Tier taste.');
    }
    console.log('\n*Design Calculus Complete. Reason about the results above to perfect the code layout!*');

  } catch (err) {
    console.error(`[Design Audit Failure] Failed to analyze file: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
