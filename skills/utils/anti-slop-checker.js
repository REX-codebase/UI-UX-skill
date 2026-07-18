#!/usr/bin/env node

/**
 * UI-UX-Skill Anti-AI-Slop Checker v1.0
 * Scans HTML/CSS/JS files for banned AI-slop patterns
 * Ensures agents produce god-tier, premium-quality code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Load banned patterns from CSV
function loadBannedPatterns() {
  const csvPath = path.join(__dirname, '../design-skill/references/ai-slop-banned.csv');
  const cachePath = path.join(os.tmpdir(), 'anti-slop-cache.json');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ ai-slop-banned.csv not found at:', csvPath);
    process.exit(1);
  }
  
  const csvStats = fs.statSync(csvPath);
  const csvMtime = csvStats.mtimeMs;
  
  if (fs.existsSync(cachePath)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (cacheData.timestamp >= csvMtime) {
        return cacheData.patterns;
      }
    } catch (e) {
      // Ignore cache read errors
    }
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  const patterns = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const match = line.match(/^([^,]+),([^,]+),(.+),(critical|high|medium|low),(.*)$/i);
    
    if (match) {
      const id = match[1].trim();
      const category = match[2].trim();
      const pattern = match[3].trim();
      const rawSeverity = match[4].trim();
      const description = match[5].trim();
      
      const severityStr = rawSeverity || 'High';
      const severity = severityStr.charAt(0).toUpperCase() + severityStr.slice(1).toLowerCase();

      patterns.push({
        id,
        category: category || 'General',
        pattern,
        description: description || '',
        severity
      });
    }
  }
  
  try {
    fs.writeFileSync(cachePath, JSON.stringify({
      timestamp: csvMtime,
      patterns: patterns
    }));
  } catch (e) {
    // Ignore cache write errors
  }
  
  return patterns;
}

const SEMANTIC_SLOP_PATTERNS = [
  { id: 'S001', category: 'Content', pattern: /Lorem\s+Ipsum|lorem\s+ipsum/i, description: 'Placeholder text', severity: 'Critical' },
  { id: 'S002', category: 'Content', pattern: /dolor\s+sit\s+amet/i, description: 'Placeholder text', severity: 'Critical' },
  { id: 'S003', category: 'Content', pattern: /Welcome\s+to\s+our\s+website/i, description: 'Generic welcome', severity: 'High' },
  { id: 'S004', category: 'Content', pattern: /Click\s+here\s+to\s+learn\s+more/i, description: 'Generic CTA', severity: 'High' },
  { id: 'S005', category: 'Content', pattern: /Read\s+more/i, description: 'Generic CTA', severity: 'High' },
  { id: 'S006', category: 'Content', pattern: /John\s+Doe/i, description: 'Placeholder name', severity: 'High' },
  { id: 'S007', category: 'Content', pattern: /Jane\s+Doe/i, description: 'Placeholder name', severity: 'High' },
  { id: 'S008', category: 'Content', pattern: /foo\s+bar/i, description: 'Placeholder dev text', severity: 'High' },
  { id: 'S009', category: 'Content', pattern: /insert\s+text\s+here/i, description: 'Placeholder instruction', severity: 'Critical' },
  { id: 'S010', category: 'Content', pattern: /your\s+text\s+here/i, description: 'Placeholder instruction', severity: 'Critical' },
  { id: 'S011', category: 'Content', pattern: /coming\s+soon/i, description: 'Unfinished content', severity: 'Medium' },
  { id: 'S012', category: 'Content', pattern: /under\s+construction/i, description: 'Unfinished content', severity: 'Medium' },
  { id: 'S013', category: 'Content', pattern: /Hello\s+World/i, description: 'Placeholder dev text', severity: 'High' },
  { id: 'S014', category: 'Content', pattern: /Test\s+title/i, description: 'Placeholder dev text', severity: 'High' },
  { id: 'S015', category: 'Content', pattern: /Sample\s+text/i, description: 'Placeholder dev text', severity: 'High' },
  { id: 'S016', category: 'Content', pattern: /dummy\s+text/i, description: 'Placeholder text', severity: 'Critical' },
  { id: 'S017', category: 'Content', pattern: /Example\s+Domain/i, description: 'Placeholder domain', severity: 'High' },
  { id: 'S018', category: 'Content', pattern: /123\s+Main\s+St/i, description: 'Placeholder address', severity: 'High' },
  { id: 'S019', category: 'Content', pattern: /anytown,\s+usa/i, description: 'Placeholder address', severity: 'High' },
  { id: 'S020', category: 'Content', pattern: /555-0199/i, description: 'Placeholder phone', severity: 'High' },
  { id: 'S021', category: 'Content', pattern: /example\.com/i, description: 'Placeholder domain', severity: 'High' },
  { id: 'S022', category: 'Content', pattern: /user@example\.com/i, description: 'Placeholder email', severity: 'High' },
  { id: 'S023', category: 'Content', pattern: /placeholder/i, description: 'Placeholder indicator', severity: 'High' }
];

// Additional hardcoded patterns from premium analysis
const PREMIUM_BANNED_PATTERNS = [
  {
    id: 'P001',
    category: 'Typography',
    pattern: /(font-family[^:]*[:\s]*(['"])(Inter|Roboto|Poppins|Montserrat|Open\s*Sans)\1|class[^=]*=["'][^"']*font-(inter|roboto|poppins|montserrat|open-sans))/i,
    description: 'Default AI fonts - use underrated fonts from CSV instead',
    severity: 'Critical'
  },
  {
    id: 'P002',
    category: 'Colors',
    pattern: /(blue-500|indigo-600|purple-500|#3b82f6|#6366f1)/i,
    description: 'Default Tailwind blue/purple colors - use OKLCH perceptual colors',
    severity: 'Critical'
  },
  {
    id: 'P003',
    category: 'Layout',
    pattern: /(grid-cols-3|grid-cols-4)/,
    description: 'Generic 3-4 column grids - use Bento Grid 2.0 instead',
    severity: 'High'
  },
  {
    id: 'P004',
    category: 'Animation',
    pattern: /transition-all\s+duration-300\s+ease-in-out/i,
    description: 'Generic transition - use spring physics instead',
    severity: 'High'
  },
  {
    id: 'P005',
    category: 'Layout',
    pattern: /mx-auto\s+max-w-7xl/i,
    description: 'Centered hero layout - use asymmetric layouts instead',
    severity: 'High'
  },
  {
    id: 'P006',
    category: 'Content',
    pattern: /Lorem\s+Ipsum|lorem\s+ipsum/i,
    description: 'Placeholder text - use real, empathetic copy instead',
    severity: 'Critical'
  },
  {
    id: 'P007',
    category: 'Components',
    pattern: /(card\s+bg-white\s+shadow-lg|glass\s+panel)/i,
    description: 'Generic card soup - use contextual surfaces instead',
    severity: 'High'
  },
  {
    id: 'P008',
    category: 'Icons',
    pattern: /(fa\s+fa-|Font\s*Awesome)/i,
    description: 'Font Awesome defaults - use custom SVG instead',
    severity: 'Medium'
  },
  {
    id: 'P009',
    category: 'Typography',
    pattern: /text-gray-500|text-gray-400/i,
    description: 'Default gray text - use semantic color names',
    severity: 'Medium'
  },
  {
    id: 'P010',
    category: 'Animation',
    pattern: /ease-in-out|linear/i,
    description: 'Linear easing - use spring curves instead',
    severity: 'High'
  },
  ...SEMANTIC_SLOP_PATTERNS
];

// Premium patterns that should be present
const PREMIUM_REQUIRED_PATTERNS = [
  {
    id: 'PR001',
    category: 'Typography',
    pattern: /(oklch\(|OKLCH)/i,
    description: 'OKLCH color space usage',
    required: true
  },
  {
    id: 'PR002',
    category: 'Animation',
    pattern: /(cubic-bezier\(|spring)/i,
    description: 'Custom easing curves',
    required: true
  },
  {
    id: 'PR003',
    category: 'Layout',
    pattern: /(clip-path|clipPath)/i,
    description: 'Organic clip-path usage',
    required: false
  },
  {
    id: 'PR004',
    category: 'Typography',
    pattern: /(Instrument\s+Sans|Instrument\s+Serif|Bricolage\s+Grotesque)/i,
    description: 'Underrated font usage',
    required: false
  }
];

function checkFile(filePath, patterns, requiredPatterns) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  const premiumFeatures = [];
  
  // Check for banned patterns
  for (const pattern of patterns) {
    if (pattern.pattern instanceof RegExp) {
      if (pattern.pattern.test(content)) {
        violations.push({
          ...pattern,
          file: filePath,
          line: findLineNumber(content, pattern.pattern)
        });
      }
    } else {
      if (content.includes(pattern.pattern)) {
        violations.push({
          ...pattern,
          file: filePath,
          line: findLineNumber(content, new RegExp(pattern.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
        });
      }
    }
  }
  
  // Check for premium patterns
  for (const pattern of requiredPatterns) {
    if (pattern.pattern instanceof RegExp) {
      if (pattern.pattern.test(content)) {
        premiumFeatures.push({
          ...pattern,
          file: filePath
        });
      }
    } else {
      if (content.includes(pattern.pattern)) {
        premiumFeatures.push({
          ...pattern,
          file: filePath
        });
      }
    }
  }
  
  return { violations, premiumFeatures };
}

function findLineNumber(content, regex) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      return i + 1;
    }
  }
  console.error(err); return null;
}

function getSeverityColor(severity) {
  const colors = {
    Critical: '🔴',
    High: '🟠',
    Medium: '🟡',
    Low: '🟢'
  };
  return colors[severity] || '⚪';
}

async function performGeometricAudit(htmlFilePath) {
  try {
    const screenshot = require('./screenshot');
    const imageAnalyzer = require('./image-analyzer');
    
    const outputPath = path.join(path.dirname(htmlFilePath), `.audit-screenshot-${Date.now()}.png`);
    
    // Capture screenshot
    await screenshot.captureScreenshot({
      url: htmlFilePath,
      output: outputPath,
      width: 1280,
      height: 800
    });
    
    if (!fs.existsSync(outputPath)) {
      console.error(err); return null;
    }
    
    const buffer = fs.readFileSync(outputPath);
    const pngInfo = imageAnalyzer.parsePNG(buffer);
    
    // Calculate Symmetry
    const { width, height, pixels } = pngInfo;
    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);
    
    let leftLum = 0, rightLum = 0;
    let topLum = 0, bottomLum = 0;
    
    // Quadrants for dead zone analysis
    // Q1: Top-Left, Q2: Top-Right, Q3: Bottom-Left, Q4: Bottom-Right
    let q1Whitespace = 0, q2Whitespace = 0, q3Whitespace = 0, q4Whitespace = 0;
    const whitespaceThreshold = 245; // Lum > 245 is considered whitespace
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = pixels[y][x];
        const lum = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;
        
        // Symmetry halves
        if (x < midX) leftLum += lum;
        else rightLum += lum;
        
        if (y < midY) topLum += lum;
        else bottomLum += lum;
        
        // Dead zone calculation
        if (lum > whitespaceThreshold) {
          if (y < midY && x < midX) q1Whitespace++;
          else if (y < midY && x >= midX) q2Whitespace++;
          else if (y >= midY && x < midX) q3Whitespace++;
          else q4Whitespace++;
        }
      }
    }
    
    const hImbalance = Math.abs(leftLum - rightLum) / Math.max(leftLum + rightLum, 1);
    const vImbalance = Math.abs(topLum - bottomLum) / Math.max(topLum + bottomLum, 1);
    
    const hSymmetryScore = 1.0 - hImbalance;
    const vSymmetryScore = 1.0 - vImbalance;
    const symmetryCoefficient = (hSymmetryScore + vSymmetryScore) / 2;
    
    const quadrantArea = midX * midY;
    const deadZones = [];
    if (q1Whitespace / quadrantArea > 0.5) deadZones.push('Top-Left');
    if (q2Whitespace / quadrantArea > 0.5) deadZones.push('Top-Right');
    if (q3Whitespace / quadrantArea > 0.5) deadZones.push('Bottom-Left');
    if (q4Whitespace / quadrantArea > 0.5) deadZones.push('Bottom-Right');
    
    // Cleanup
    fs.unlinkSync(outputPath);
    
    return {
      symmetryCoefficient: Number(symmetryCoefficient.toFixed(3)),
      horizontalImbalance: Number(hImbalance.toFixed(3)),
      verticalImbalance: Number(vImbalance.toFixed(3)),
      deadZones,
      flags: {
        highImbalance: hImbalance > 0.3,
        hasDeadZones: deadZones.length > 0
      }
    };
  } catch (err) {
    console.error(err); return null;
  }
}

function calculateScore(violations, premiumFeatures, fileCount, allGeometricFindings) {
  // Base score
  let score = 100;
  
  // Deduct for violations
  violations.forEach(violation => {
    const deduction = {
      Critical: 20,
      High: 10,
      Medium: 5,
      Low: 2
    }[violation.severity] || 0;
    score -= deduction;
  });
  
  // Bonus for premium features
  premiumFeatures.forEach(feature => {
    if (feature.required) {
      score += 5;
    } else {
      score += 2;
    }
  });
  
  // Geometric penalties
  if (allGeometricFindings) {
    for (const geo of Object.values(allGeometricFindings)) {
      if (geo.flags.highImbalance) {
        score -= 20;
      }
      if (geo.flags.hasDeadZones) {
        score -= 15 * geo.deadZones.length;
      }
      if (geo.symmetryCoefficient > 0.9) {
        score += 10;
      }
    }
  }
  
  // Force 0 if generic placeholder text patterns are found
  const hasSlop = violations.some(v => v.id.startsWith('S0') || v.id === 'P006');
  if (hasSlop) {
    score = 0;
  }
  
  // Normalize
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

function printHelp() {
  console.log('\n📖 UI-UX-Skill Anti-AI-Slop Checker');
  console.log('='.repeat(50));
  console.log('\nUsage:');
  console.log('  node skills/utils/anti-slop-checker.js --file <path> [--export json]');
  console.log('  node skills/utils/anti-slop-checker.js --dir <directory>');
  console.log('\nOptions:');
  console.log('  --file <path>    Check a single file');
  console.log('  --dir <path>     Check all files in a directory');
  console.log('  --export json    Export findings as structured JSON');
  console.log('  --help           Show this help message');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }
  
  let filePaths = [];
  let exportFormat = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      filePaths.push(args[i + 1]);
      i++;
    } else if (args[i] === '--dir' && args[i + 1]) {
      const dirPath = args[i + 1];
      const files = getAllFiles(dirPath);
      filePaths = filePaths.concat(files);
      i++;
    } else if (args[i] === '--export' && args[i + 1]) {
      exportFormat = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--help') {
      printHelp();
      process.exit(0);
    }
  }
  
  if (filePaths.length === 0) {
    console.error('❌ No files specified for checking');
    process.exit(1);
  }
  
  const bannedPatterns = loadBannedPatterns();
  const allPatterns = [...bannedPatterns, ...PREMIUM_BANNED_PATTERNS];
  
  let allViolations = [];
  let allPremiumFeatures = [];
  let allGeometricFindings = {};
  
  for (const filePath of filePaths) {
    try {
      const result = checkFile(filePath, allPatterns, PREMIUM_REQUIRED_PATTERNS);
      allViolations = allViolations.concat(result.violations);
      allPremiumFeatures = allPremiumFeatures.concat(result.premiumFeatures);
      
      // Perform geometric audit if it's an HTML file
      if (filePath.endsWith('.html')) {
         const geometricFindings = await performGeometricAudit(filePath);
         if (geometricFindings) {
            allGeometricFindings[filePath] = geometricFindings;
         }
      }
      
    } catch (error) {
      if (exportFormat !== 'json') {
        console.error(`❌ Error reading file: ${filePath}`);
      }
    }
  }
  
  const totalScore = calculateScore(allViolations, allPremiumFeatures, filePaths.length, allGeometricFindings);
  
  if (exportFormat === 'json') {
    const report = {
      score: totalScore,
      filesScanned: filePaths.length,
      violations: allViolations,
      premiumFeatures: allPremiumFeatures,
      geometricFindings: allGeometricFindings,
      recommendations: []
    };
    
    if (allViolations.length > 0) {
       report.recommendations.push('Replace generic slop content and basic fonts');
    }
    
    for (const [file, geo] of Object.entries(allGeometricFindings)) {
       if (geo.flags.highImbalance) {
          report.recommendations.push(`Fix visual imbalance in ${file}: Horizontal imbalance > 30%`);
       }
       if (geo.flags.hasDeadZones) {
          report.recommendations.push(`Distribute whitespace better in ${file}. Dead zones found in: ${geo.deadZones.join(', ')}`);
       }
    }
    
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  
  // Standard Print Report
  console.log('\n' + '='.repeat(80));
  console.log('   🛡️  UI-UX-SKILL ANTI-AI-SLOP AUDIT REPORT');
  console.log('='.repeat(80) + '\n');
  
  console.log('📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Files Scanned: ${filePaths.length}`);
  console.log(`Violations Found: ${allViolations.length}`);
  console.log(`Premium Features: ${allPremiumFeatures.length}`);
  
  const severityCounts = {
    Critical: allViolations.filter(v => v.severity === 'Critical').length,
    High: allViolations.filter(v => v.severity === 'High').length,
    Medium: allViolations.filter(v => v.severity === 'Medium').length,
    Low: allViolations.filter(v => v.severity === 'Low').length
  };
  
  console.log(`\nSeverity Breakdown:`);
  console.log(`  ${getSeverityColor('Critical')} Critical: ${severityCounts.Critical}`);
  console.log(`  ${getSeverityColor('High')} High: ${severityCounts.High}`);
  console.log(`  ${getSeverityColor('Medium')} Medium: ${severityCounts.Medium}`);
  console.log(`  ${getSeverityColor('Low')} Low: ${severityCounts.Low}`);
  
  if (Object.keys(allGeometricFindings).length > 0) {
    console.log('\n📐 GEOMETRIC MATH AUDIT');
    console.log('-'.repeat(80));
    for (const [file, geo] of Object.entries(allGeometricFindings)) {
       console.log(`  File: ${file}`);
       console.log(`  Symmetry Coefficient: ${geo.symmetryCoefficient}`);
       console.log(`  Horizontal Imbalance: ${(geo.horizontalImbalance * 100).toFixed(1)}% ${geo.flags.highImbalance ? '❌ (Exceeds 30%)' : '✅'}`);
       console.log(`  Whitespace Dead Zones: ${geo.deadZones.length > 0 ? '❌ ' + geo.deadZones.join(', ') : '✅ None'}`);
    }
  }
  
  if (allPremiumFeatures.length > 0) {
    console.log('\n✨ PREMIUM FEATURES DETECTED');
    console.log('-'.repeat(80));
    allPremiumFeatures.forEach(feature => {
      console.log(`  ✅ ${feature.id}: ${feature.description} (${feature.category})`);
    });
  }
  
  if (allViolations.length > 0) {
    console.log('\n❌ VIOLATIONS FOUND');
    console.log('-'.repeat(80));
    allViolations.forEach(violation => {
      const lineInfo = violation.line ? ` (Line ${violation.line})` : '';
      console.log(`\n${getSeverityColor(violation.severity)} [${violation.severity}] ${violation.id}`);
      console.log(`   File: ${violation.file}${lineInfo}`);
      console.log(`   Category: ${violation.category}`);
      console.log(`   Issue: ${violation.description}`);
      console.log(`   Pattern: ${violation.pattern}`);
    });
  } else {
    console.log('\n✅ NO VIOLATIONS FOUND - God Tier Quality!');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`   🎯 PREMIUM SCORE: ${totalScore}/100`);
  console.log('='.repeat(80) + '\n');
  
  if (allViolations.length > 0 || Object.values(allGeometricFindings).some(g => g.flags.highImbalance || g.flags.hasDeadZones)) {
    console.log('💡 RECOMMENDATIONS:');
    console.log('-'.repeat(80));
    let recCount = 1;
    if (allViolations.length > 0) {
      console.log(`${recCount++}. Replace all generic/placeholder text with meaningful copy`);
      console.log(`${recCount++}. Convert hex colors to OKLCH`);
      console.log(`${recCount++}. Use Custom SVG icons instead of Font Awesome`);
    }
    for (const [file, geo] of Object.entries(allGeometricFindings)) {
      if (geo.flags.highImbalance) {
         console.log(`${recCount++}. Fix visual imbalance in layout (${file}) to achieve >70% symmetry`);
      }
      if (geo.flags.hasDeadZones) {
         console.log(`${recCount++}. Add density to whitespace dead zones (${geo.deadZones.join(', ')}) in ${file}`);
      }
    }
    console.log('\n');
  }
}

function getAllFiles(dirPath) {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        if (['.html', '.css', '.js', '.jsx', '.tsx', '.ts'].includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    }
  }
  walk(dirPath);
  return files;
}

main();
