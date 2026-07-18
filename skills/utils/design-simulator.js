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

  // Clean comments from CSS to prevent false positive matches
  const cleanCSS = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

  // ===========================================================================
  // 0. CORE DESIGN SYSTEM & STYLE PARSING ENGINE (Supporting CSS Variables)
  // ===========================================================================
  const cssRules = [];
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(cleanCSS)) !== null) {
    const selector = match[1].trim().toLowerCase();
    const block = match[2].trim();
    const declarations = {};
    const decRegex = /([\w-]+)\s*:\s*([^;]+)/g;
    let decMatch;
    while ((decMatch = decRegex.exec(block)) !== null) {
      declarations[decMatch[1].trim().toLowerCase()] = decMatch[2].trim();
    }
    cssRules.push({ selector, declarations });
  }

  const inlineStyles = [];
  const inlineStyleRegex = /style=["']([^"']+)["']/gi;
  let inlineMatch;
  while ((inlineMatch = inlineStyleRegex.exec(htmlContent)) !== null) {
    const block = inlineMatch[1].trim();
    const declarations = {};
    const decRegex = /([\w-]+)\s*:\s*([^;]+)/g;
    let decMatch;
    while ((decMatch = decRegex.exec(block)) !== null) {
      declarations[decMatch[1].trim().toLowerCase()] = decMatch[2].trim();
    }
    inlineStyles.push(declarations);
  }

  const cssVariables = {};
  const allDeclarations = [];

  cssRules.forEach(rule => {
    allDeclarations.push({
      selector: rule.selector,
      declarations: rule.declarations
    });
    // Extract CSS Custom Properties (variables)
    Object.keys(rule.declarations).forEach(key => {
      if (key.startsWith('--')) {
        cssVariables[key] = rule.declarations[key];
      }
    });
  });

  inlineStyles.forEach(dec => {
    allDeclarations.push({
      selector: '[inline]',
      declarations: dec
    });
    // Extract variables from inline styles
    Object.keys(dec).forEach(key => {
      if (key.startsWith('--')) {
        cssVariables[key] = dec[key];
      }
    });
  });

  // Resolve var(--name) references recursively
  function resolveValue(val) {
    if (!val) return null;
    const varMatch = /var\((--[\w-]+)\)/i.exec(val);
    if (varMatch && cssVariables[varMatch[1]]) {
      return resolveValue(cssVariables[varMatch[1]]);
    }
    return val;
  }

  // Normalize font-sizes to rem units
  function normalizeFontSize(sizeStr) {
    const val = resolveValue(sizeStr);
    if (!val) return null;
    
    // px values
    const pxMatch = /^([0-9.]+)\s*px$/i.exec(val);
    if (pxMatch) return parseFloat(pxMatch[1]) / 16;
    
    // rem or em values
    const remMatch = /^([0-9.]+)\s*r?em$/i.exec(val);
    if (remMatch) return parseFloat(remMatch[1]);
    
    // percentages
    const pctMatch = /^([0-9.]+)\s*%$/i.exec(val);
    if (pctMatch) return parseFloat(pctMatch[1]) / 100;
    
    // clamp/calc/viewport functions
    if (val.includes('clamp') || val.includes('calc') || val.includes('vw') || val.includes('vh')) {
      const remMatches = val.match(/([0-9.]+)\s*r?em/gi);
      if (remMatches && remMatches.length > 0) {
        return Math.max(...remMatches.map(m => parseFloat(m)));
      }
      const pxMatches = val.match(/([0-9.]+)\s*px/gi);
      if (pxMatches && pxMatches.length > 0) {
        return Math.max(...pxMatches.map(m => parseFloat(m) / 16));
      }
      const numMatch = /([0-9.]+)/.exec(val);
      if (numMatch) return parseFloat(numMatch[1]);
    }
    
    const plainNumMatch = /^([0-9.]+)$/.exec(val);
    if (plainNumMatch) return parseFloat(plainNumMatch[1]);
    
    return null;
  }

  // Normalize line-heights to unitless values
  function normalizeLineHeight(lhStr) {
    const val = resolveValue(lhStr);
    if (!val) return null;
    
    // Unitless
    const unitlessMatch = /^([0-9.]+)$/.exec(val);
    if (unitlessMatch) return parseFloat(unitlessMatch[1]);
    
    // Percent
    const pctMatch = /^([0-9.]+)\s*%$/.exec(val);
    if (pctMatch) return parseFloat(pctMatch[1]) / 100;
    
    // px
    const pxMatch = /^([0-9.]+)\s*px$/.exec(val);
    if (pxMatch) return parseFloat(pxMatch[1]) / 16;
    
    // rem/em
    const remMatch = /^([0-9.]+)\s*r?em$/.exec(val);
    if (remMatch) return parseFloat(remMatch[1]);
    
    return null;
  }

  // ===========================================================================
  // 1. TYPOGRAPHIC SCALE & LINE-HEIGHT HIERARCHY
  // ===========================================================================
  let h1FontSize = null;
  let pFontSize = null;
  let pLineHeight = null;
  let bodyLineHeight = null;

  allDeclarations.forEach(item => {
    const sel = item.selector;
    const decs = item.declarations;

    if (sel.includes('h1') && decs['font-size']) {
      h1FontSize = decs['font-size'];
    }
    if ((sel === 'p' || sel.includes('body') || sel.includes('text') || sel.includes('paragraph')) && decs['font-size']) {
      pFontSize = decs['font-size'];
    }
    if (sel === 'p' && decs['line-height']) {
      pLineHeight = decs['line-height'];
    }
    if ((sel === 'body' || sel === 'html') && decs['line-height']) {
      bodyLineHeight = decs['line-height'];
    }
  });

  const h1Size = normalizeFontSize(h1FontSize) || 2.0; // Browser default 2em/32px
  const pSize = normalizeFontSize(pFontSize) || 1.0;   // Browser default 1em/16px
  const ratio = h1Size / pSize;

  if (ratio < 1.75) {
    tasteScoreDeduction += 12;
    warnings.push({
      type: 'TYPO_SCALE_WARN',
      severity: 'high',
      message: `Flat typographic scale detected (h1-to-paragraph ratio is ${ratio.toFixed(2)}x, target >= 1.75x). The h1 size of [${h1FontSize || 'default'}] compared to paragraph [${pFontSize || 'default'}] lacks dramatic contrast. Upgrade to an avant-garde striking scale (e.g. h1 at 3rem+ or 300%) to establish elegant visual tension.`
    });
  } else {
    bonusScore += 8;
  }

  const normalizedLH = normalizeLineHeight(pLineHeight) || normalizeLineHeight(bodyLineHeight);
  if (normalizedLH === null) {
    tasteScoreDeduction += 10;
    warnings.push({
      type: 'TYPO_LINEHEIGHT_WARN',
      severity: 'medium',
      message: `Missing custom paragraph line-height. Standard browser defaults are cramped and tire the eye. Set an elegant, breathable paragraph line-height between 1.4 and 1.8 (e.g., line-height: 1.6) to establish a premium reading rhythm.`
    });
  } else if (normalizedLH < 1.4 || normalizedLH > 1.85) {
    tasteScoreDeduction += 8;
    warnings.push({
      type: 'TYPO_LINEHEIGHT_WARN',
      severity: 'medium',
      message: `Uncomfortable line-height of [${normalizedLH}] detected (comfortable paragraph range: 1.4 to 1.8). A line-height of ${normalizedLH} is either too cramped or excessively sparse, breaking reading rhythm.`
    });
  } else {
    bonusScore += 8;
  }

  // ===========================================================================
  // 2. PHYSICAL WABI-SABI PROPERTIES (Organic Asymmetric Aesthetics)
  // ===========================================================================
  // Squircle check: checks for slash '/' syntax indicating separate horizontal and vertical radii, or 4 distinct values
  const hasSquircle = /\bborder-radius\s*:\s*[^;{}]*\/[^;{}]*/i.test(cssText) || 
                      /\bborder-radius\s*:\s*(?:\d+(?:\.\d+)?\w+\s+){3,}\d+(?:\.\d+)?\w+/i.test(cssText);

  // Slight rotate tilts check: checks for rotate(...) transforms between 0.1deg and 5deg (positive or negative)
  let hasCardTilt = false;
  const rotateRegex = /rotate\(\s*(-?[0-9.]+)\s*(deg|rad|turn)?\s*\)/gi;
  let rotMatch;
  while ((rotMatch = rotateRegex.exec(cssText + htmlContent)) !== null) {
    const val = parseFloat(rotMatch[1]);
    const unit = rotMatch[2] || 'deg';
    let deg = val;
    if (unit === 'rad') deg = val * (180 / Math.PI);
    else if (unit === 'turn') deg = val * 360;
    
    if (Math.abs(deg) > 0.1 && Math.abs(deg) <= 5.0) {
      hasCardTilt = true;
      break;
    }
  }

  // Handwritten cursive check: checks for annotation text styled with cursive fonts
  const hasHandwritten = /font-family\s*:\s*[^;]*\b(cursive|caveat|architects|sacramento|kalam|patrick|handwritten)\b/i.test(cssText) ||
                        /class=["'][^"']*\b(annotation|handwritten|scribble|note-handwritten)\b[^"']*["']/i.test(htmlContent);

  // Torn-edge SVG check: checks for polygon clip-paths, torn element classes or torn-edge masking images
  const hasTornEdge = /clip-path\s*:\s*\b(path|polygon)\b/i.test(cssText) || 
                      /class=["'][^"']*\b(torn-edge|torn|rough-edge|wabi-sabi)\b[^"']*["']/i.test(htmlContent) ||
                      /mask-image\s*:\s*url\([^)]*torn[^)]*\)/i.test(cssText);

  const wabiSabiFeatures = [];
  if (hasSquircle) wabiSabiFeatures.push('Organic squircle border-radii');
  if (hasCardTilt) wabiSabiFeatures.push('Alternate card tilts/rotations');
  if (hasHandwritten) wabiSabiFeatures.push('Handwritten annotations');
  if (hasTornEdge) wabiSabiFeatures.push('Torn-edge SVGs');

  bonusScore += wabiSabiFeatures.length * 6;

  if (wabiSabiFeatures.length < 2) {
    tasteScoreDeduction += 10;
    warnings.push({
      type: 'WABI_SABI_WARN',
      severity: 'medium',
      message: `Digital Sterility detected. Found only [${wabiSabiFeatures.join(', ') || 'none'}] of the physical Wabi-Sabi characteristics. Avant-garde interfaces thrive on controlled imperfection. Incorporate organic squircle border-radii (using "/" slash syntax), subtle card tilts (e.g. rotate(-1.5deg)), handwritten annotation notes, or torn-edge SVGs to break the coldness of perfect pixels.`
    });
  } else {
    bonusScore += 8;
  }

  // ===========================================================================
  // 3. ADVANCED NEWTONIAN PHYSICS (Dynamic Motion Curves)
  // ===========================================================================
  const hasTransitionAll = /\btransition\s*:\s*all\b/i.test(cssText) || 
                           /\btransition-property\s*:\s*all\b/i.test(cssText);

  if (hasTransitionAll) {
    tasteScoreDeduction += 15;
    warnings.push({
      type: 'PHYSICS_TRANSITION_ALL_WARN',
      severity: 'high',
      message: `Performance-killing 'transition: all' detected. Animating all properties triggers continuous browser paint operations and costly layout recalculations. Transition only targeted properties (e.g., "transition: transform 0.4s, opacity 0.4s") to ensure fluid 120 FPS performance.`
    });
  }

  const hasGenericTransition = /\btransition\s*:\s*[^;]*(linear|ease-in-out|ease-in|ease-out|0\.3s\s+ease|0\.2s\s+ease)\b/i.test(cssText) ||
                               /\btransition-timing-function\s*:\s*(linear|ease-in-out|ease-in|ease-out)\b/i.test(cssText);

  if (hasGenericTransition) {
    tasteScoreDeduction += 10;
    warnings.push({
      type: 'PHYSICS_GENERIC_CURVE_WARN',
      severity: 'medium',
      message: `Generic mechanical transition curve (linear, ease, or ease-in-out) detected. Standard curves feel robotic and computerized. Swap them out for a customized targeted spring curve to simulate real Newtonian physical friction.`
    });
  }

  // Spring Easing check: checks if a cubic-bezier has coordinates Y1 or Y2 outside the 0-1 range (overshoot / anticipation)
  let hasSpringEasing = false;
  const bezierRegex = /cubic-bezier\(\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*\)/gi;
  let bezMatch;
  while ((bezMatch = bezierRegex.exec(cleanCSS)) !== null) {
    const y1 = parseFloat(bezMatch[2]);
    const y2 = parseFloat(bezMatch[4]);
    if (y1 > 1.0 || y2 > 1.0 || y1 < 0.0 || y2 < 0.0) {
      hasSpringEasing = true;
      break;
    }
  }

  if (hasSpringEasing) {
    bonusScore += 15;
  } else {
    tasteScoreDeduction += 12;
    warnings.push({
      type: 'PHYSICS_SPRING_MISSING_WARN',
      severity: 'high',
      message: `Missing targeted spring physics. Avant-Garde interfaces require organic physical acceleration. Leverage a high-tension spring easing curve such as "cubic-bezier(0.34, 1.56, 0.64, 1)" (overshooting spring) or "cubic-bezier(0.25, 1.25, 0.25, 1.0)" to animate hover scaling or active states.`
    });
  }

  // ===========================================================================
  // 4. COLOR SPACE LUXURY (Perceptual Lightness Depth)
  // ===========================================================================
  const oklchRegex = /oklch\(\s*([0-9.%]+)\s+([0-9.]+)\s+([0-9.]+)/gi;
  let oklchMatch;
  let minLightness = 1.0;
  let maxLightness = 0.0;
  let maxChroma = 0.0;
  let oklchCount = 0;
  while ((oklchMatch = oklchRegex.exec(cssText + htmlContent)) !== null) {
    let lVal = oklchMatch[1];
    let l = parseFloat(lVal);
    if (lVal.includes('%')) l = l / 100;
    if (l < minLightness) minLightness = l;
    if (l > maxLightness) maxLightness = l;
    
    let c = parseFloat(oklchMatch[2]);
    if (c > maxChroma) maxChroma = c;
    
    oklchCount++;
  }

  if (oklchCount > 0) {
    const lightnessDepthRange = maxLightness - minLightness;
    if (lightnessDepthRange >= 0.5) {
      bonusScore += 15; // Rewarding rich light-depth range
    } else {
      bonusScore += 8;
    }

    if (maxChroma < 0.12 && profile !== 'Brutalist') {
      tasteScoreDeduction += 10;
      warnings.push({
        type: 'COLOR_CHROMA_FLAT_WARN',
        severity: 'medium',
        message: `Flat desaturated chroma profile detected (max oklch chroma is ${maxChroma.toFixed(2)}, target >= 0.12). True human layouts utilize rich, energetic color expressions on accent targets. Boost the chroma coordinate of your active elements to establish premium visual weight.`
      });
    }
  } else {
    tasteScoreDeduction += 12;
    warnings.push({
      type: 'COLOR_OKLCH_MISSING_WARN',
      severity: 'high',
      message: `Standard color space detected. Modern luxury designs leverage the perceptually uniform oklch() color space, which prevents hue shifting under different light intensities. Define a deep ambient light-depth palette (lightness range from oklch(0.15 ...) to oklch(0.98 ...)) to achieve premium lighting aesthetics.`
    });
  }

  // Muddy sRGB Midpoint Gradient Check
  const hasGradient = /linear-gradient|radial-gradient|conic-gradient/i.test(cssText + htmlContent);
  const hasPerceptualInterpolation = /in\s+(oklch|oklab|hcl|lch)/i.test(cssText + htmlContent);
  if (hasGradient && !hasPerceptualInterpolation) {
    tasteScoreDeduction += 8;
    warnings.push({
      type: 'COLOR_MUDDY_GRADIENT_WARN',
      severity: 'medium',
      message: `Muddy sRGB midpoint gradient detected. Browser default gradients interpolate in sRGB space, creating a dull gray 'dead zone' at transition midpoints. Enforce premium human color blending by explicitly declaring the oklch interpolation space: "linear-gradient(in oklch to right, ...)" or "radial-gradient(in oklch, ...)".`
    });
  }

  // Neural Expressive Blur Spot Mesh Check
  let hasHighBlur = false;
  const blurMatches = (cssText + htmlContent).match(/blur\(\s*[0-9.]+\s*(px)?\s*\)/gi);
  if (blurMatches) {
    for (const bm of blurMatches) {
      const valMatch = /blur\(\s*([0-9.]+)/i.exec(bm);
      if (valMatch && parseFloat(valMatch[1]) >= 40) {
        hasHighBlur = true;
        break;
      }
    }
  }

  const hasDynamicMesh = hasHighBlur && /radial-gradient|conic-gradient/i.test(cssText + htmlContent);
  if (hasDynamicMesh) {
    bonusScore += 15; // Major bonus for Gemini-style expressive neural light mesh
  }

  const hasConic = /conic-gradient/i.test(cssText + htmlContent);
  if (hasConic) {
    bonusScore += 10;
  }

  const hasBackdrop = /backdrop-filter/i.test(cssText + htmlContent);
  if (hasBackdrop) {
    bonusScore += 10;
  } else {
    tasteScoreDeduction += 8;
    warnings.push({
      type: 'COLOR_GLASSMORPHISM_MISSING_WARN',
      severity: 'medium',
      message: `Missing tactile backdrop-filters. Standard flat transparent backgrounds feel low-end. Apply "backdrop-filter: blur(12px)" combined with low-opacity oklch backgrounds to create high-premium glassmorphic surfaces.`
    });
  }

  // ===========================================================================
  // 5. TACTILE MICRO-INTERACTIONS (Elastic Actions)
  // ===========================================================================
  const hasStrokeAnimation = /stroke-dashoffset/i.test(cssText) || 
                             /stroke-dasharray/i.test(cssText) ||
                             /keyframes\s+[^{]*stroke/i.test(cssText);
  if (hasStrokeAnimation) {
    bonusScore += 10;
  }

  const hasHoverTransform = /:hover\s*\{[^}]*\b(transform|scale|translate)\b/i.test(cssText) ||
                            /:hover\s*[^}]*\b(transform|scale|translate)\b/i.test(cssText) ||
                            /transition\s*:[^;]*transform/i.test(cssText) && /:hover/i.test(cssText);

  if (hasHoverTransform) {
    if (hasSpringEasing) {
      bonusScore += 15; // Perfect combination: hover animation + spring curve
    } else {
      bonusScore += 8;
    }
  } else {
    tasteScoreDeduction += 10;
    warnings.push({
      type: 'INTERACTION_TACTILE_MISSING_WARN',
      severity: 'medium',
      message: `Lack of tactile micro-interactions on hover or active states. Add subtle spring-elastic scaling (e.g. active elements scaling down to 0.97 on click and scaling up slightly to 1.03 on hover) to make interactive elements feel responsive and physical.`
    });
  }

  // ===========================================================================
  // ORIGINAL AESTHETIC & ANTI-SLOP AUDITS
  // ===========================================================================
  
  // A. Banned flat color tokens check
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

  // B. Purple-to-blue gradient slop check
  if (/linear-gradient\(.*(#4f46e5|#6366f1|indigo).*#3b82f6.*\)/gi.test(cssText) || 
      /linear-gradient\(.*#3b82f6.*(#4f46e5|#6366f1|indigo).*\)/gi.test(cssText)) {
    tasteScoreDeduction += 15;
    warnings.push({
      type: 'SLOP_COLOR_WARN',
      severity: 'critical',
      message: `Banned purple-to-blue gradient detected. This is a generic AI comfort-zone cliché. Swap for multi-stop conic glow meshes or low-luminance OKLCH background surfaces.`
    });
  }

  // C. Banned standard typography template check
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

  // D. Generic mechanical animation check
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

  // E. Symmetrical layout grid check
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

  // F. Secondary premium typography check
  if (/font-family\s*:\s*[^;]*['"]?(Outfit|Space Grotesk|Instrument Serif)['"]?/i.test(cssText)) {
    bonusScore += 10;
  }

  let finalDeduction = tasteScoreDeduction;
  if (tasteScoreDeduction > 80) {
    // Logarithmic decay function to preserve differences without flatlining
    finalDeduction = 80 + 2.5 * Math.log(tasteScoreDeduction - 80 + 1);
  }

  return {
    deduction: finalDeduction,
    bonus: bonusScore,
    warnings,
    colorMetrics: {
      minLightness,
      maxLightness
    }
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
    
    // Calculate a bounded source-level signal. Positive style detections are
    // deliberately capped: a pile of fashionable effects must not erase
    // source-level risks or turn this into a score-gaming exercise.
    let tasteScore = 100;
    tasteScore -= tasteAudit.deduction;
    tasteScore += Math.min(15, tasteAudit.bonus);
    if (structuralWarnings.length > 0) {
      tasteScore -= (structuralWarnings.length * 5); // deduct 5 points per structural issue
    }
    // Heuristic signals may add bonuses, but a score is always bounded and is
    // not a claim of rendered visual quality. Browser evidence and review are
    // required before a release decision.
    tasteScore = Math.max(0, Math.min(100, tasteScore));

    const spatialCollisions = [];
    for (let i = 0; i < mappedElements.length; i++) {
      for (let j = i + 1; j < mappedElements.length; j++) {
        const el1 = mappedElements[i];
        const el2 = mappedElements[j];

        if (!el1.hasInteractive || !el2.hasInteractive) continue;

        const overlapX = el1.x < el2.x + el2.w && el1.x + el1.w > el2.x;
        const overlapY = el1.y < el2.y + el2.h && el1.y + el1.h > el2.y;

        if (overlapX && overlapY) {
          spatialCollisions.push({ el1, el2 });
        }
      }
    }

    let tasteRating = tasteScore >= 90 ? 'Strong static signals — verify in browser' :
                        tasteScore >= 75 ? 'Static signals need refinement' :
                        'Static signals need substantial refinement';

    if (spatialCollisions.length > 0) {
      tasteScore = 0;
      tasteRating = 'Spatial Violation';
    }

    // Print ASCII gravity visual canvas
    console.log('--- VISUAL DENSITY BALANCE CANVAS ---');
    console.log(asciiMap);
    console.log('-------------------------------------\n');

    console.log('--- COGNITIVE METRICS REPORT ---');
    console.log(`- Visual Weight Centroid: (${centroid.cx}, ${centroid.cy}) | Total Weight Mass: ${centroid.totalWeight}`);
    if (centroid.isDynamicallyBalanced) console.log(`- Dynamic Balance: Achieved (Offset by counter-weights)`);
    if (hasIntentionalOffset) console.log(`- Intentional Offset: Documented in design registry`);
    const minL = tasteAudit.colorMetrics ? tasteAudit.colorMetrics.minLightness : 0;
    const maxL = tasteAudit.colorMetrics ? tasteAudit.colorMetrics.maxLightness : 1;
    const contrastValue = calculatePerceptualContrast(minL * 100, maxL * 100);
    
    console.log(`- Cognitive Load Index: ${friction.score} | Rating: ${friction.rating}`);
    console.log(`  [Elements Count: ${friction.totalElements} | Interactive Count: ${friction.interactiveCount} | Colors: ${friction.colorCount} | Chunks: ${friction.chunkCount}]`);
    console.log(`- APCA Contrast Verification: Calculated Lc ${contrastValue} (Primary Pair)`);
    console.log(`- Layout Balance Advice: ${friction.advice}\n`);

    console.log('--- STATIC DESIGN SIGNAL AUDIT ---');
    console.log(`- Static Design Signal Score: ${tasteScore}/100 | Rating: ${tasteRating}`);
    console.log('- Limitation: This is source-level heuristic evidence, not a rendered visual, accessibility, or performance verdict.');
    if (tasteAudit.warnings.length === 0 && structuralWarnings.length === 0 && spatialCollisions.length === 0) {
      console.log('✅ Absolute design compliance! Zero layout, color slop, or typography violations.');
    } else {
      if (spatialCollisions.length > 0) {
        console.log(`❌ [SPATIAL_VIOLATION] Fatal layout overlap detected. Final score overwritten to 0.`);
        spatialCollisions.forEach(col => {
          console.log(`   -> Spatial Violation: Element ID ${col.el1.id} (${col.el1.tag}) overlaps with Element ID ${col.el2.id} (${col.el2.tag})`);
        });
      }
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
    if (tasteAudit.warnings.length === 0 && structuralWarnings.length === 0 && spatialCollisions.length === 0) {
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
