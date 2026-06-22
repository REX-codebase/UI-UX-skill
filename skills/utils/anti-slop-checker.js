#!/usr/bin/env node

/**
 * UI-UX-Skill Anti-AI-Slop Checker v1.0
 * Scans HTML/CSS/JS files for banned AI-slop patterns
 * Ensures agents produce god-tier, premium-quality code
 */

const fs = require('fs');
const path = require('path');

// Load banned patterns from CSV
function loadBannedPatterns() {
  const csvPath = path.join(__dirname, '../design-skill/references/ai-slop-banned.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ ai-slop-banned.csv not found at:', csvPath);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  const patterns = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [id, category, pattern, rawSeverity, ...descriptionParts] = line.split(',').map(s => s.trim());
    
    if (id && pattern) {
      const severityStr = rawSeverity || 'High';
      const severity = severityStr.charAt(0).toUpperCase() + severityStr.slice(1).toLowerCase();

      patterns.push({
        id,
        category: category || 'General',
        pattern,
        description: descriptionParts.join(', ') || '',
        severity
      });
    }
  }
  
  return patterns;
}

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
  }
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
  return null;
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

function printReport(violations, premiumFeatures, fileCount) {
  console.log('\n' + '='.repeat(80));
  console.log('   🛡️  UI-UX-SKILL ANTI-AI-SLOP AUDIT REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Files Scanned: ${fileCount}`);
  console.log(`Violations Found: ${violations.length}`);
  console.log(`Premium Features: ${premiumFeatures.length}`);
  
  const severityCounts = {
    Critical: violations.filter(v => v.severity === 'Critical').length,
    High: violations.filter(v => v.severity === 'High').length,
    Medium: violations.filter(v => v.severity === 'Medium').length,
    Low: violations.filter(v => v.severity === 'Low').length
  };
  
  console.log(`\nSeverity Breakdown:`);
  console.log(`  ${getSeverityColor('Critical')} Critical: ${severityCounts.Critical}`);
  console.log(`  ${getSeverityColor('High')} High: ${severityCounts.High}`);
  console.log(`  ${getSeverityColor('Medium')} Medium: ${severityCounts.Medium}`);
  console.log(`  ${getSeverityColor('Low')} Low: ${severityCounts.Low}`);
  
  // Premium Features
  if (premiumFeatures.length > 0) {
    console.log('\n✨ PREMIUM FEATURES DETECTED');
    console.log('-'.repeat(80));
    premiumFeatures.forEach(feature => {
      console.log(`  ✅ ${feature.id}: ${feature.description} (${feature.category})`);
    });
  }
  
  // Violations
  if (violations.length > 0) {
    console.log('\n❌ VIOLATIONS FOUND');
    console.log('-'.repeat(80));
    
    violations.forEach(violation => {
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
  
  // Score
  const score = calculateScore(violations, premiumFeatures, fileCount);
  console.log('\n' + '='.repeat(80));
  console.log(`   🎯 PREMIUM SCORE: ${score}/100`);
  console.log('='.repeat(80) + '\n');
  
  // Recommendations
  if (violations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    console.log('-'.repeat(80));
    console.log('1. Replace all Inter/Roboto/Poppins with underrated fonts');
    console.log('2. Convert hex colors to OKLCH');
    console.log('3. Replace linear easing with spring curves');
    console.log('4. Use Bento Grid 2.0 instead of generic grids');
    console.log('5. Add organic clip-path animations');
    console.log('6. Implement Lenis or Locomotive Scroll');
    console.log('7. Use custom SVG icons instead of Font Awesome');
    console.log('8. Replace "Loading..." with custom animations');
    console.log('\n');
  }
}

function calculateScore(violations, premiumFeatures, fileCount) {
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
  
  // Normalize
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

function printHelp() {
  console.log('\n📖 UI-UX-Skill Anti-AI-Slop Checker');
  console.log('='.repeat(50));
  console.log('\nUsage:');
  console.log('  node skills/utils/anti-slop-checker.js --file <path>');
  console.log('  node skills/utils/anti-slop-checker.js --dir <directory>');
  console.log('\nOptions:');
  console.log('  --file <path>    Check a single file');
  console.log('  --dir <path>     Check all files in a directory');
  console.log('  --help           Show this help message');
  console.log('\nExamples:');
  console.log('  node skills/utils/anti-slop-checker.js --file index.html');
  console.log('  node skills/utils/anti-slop-checker.js --dir ./src');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }
  
  let filePaths = [];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      filePaths.push(args[i + 1]);
      i++;
    } else if (args[i] === '--dir' && args[i + 1]) {
      const dirPath = args[i + 1];
      const files = getAllFiles(dirPath);
      filePaths = filePaths.concat(files);
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
  
  // Load patterns
  const bannedPatterns = loadBannedPatterns();
  const allPatterns = [...bannedPatterns, ...PREMIUM_BANNED_PATTERNS];
  
  // Check all files
  let allViolations = [];
  let allPremiumFeatures = [];
  
  for (const filePath of filePaths) {
    try {
      const result = checkFile(filePath, allPatterns, PREMIUM_REQUIRED_PATTERNS);
      allViolations = allViolations.concat(result.violations);
      allPremiumFeatures = allPremiumFeatures.concat(result.premiumFeatures);
    } catch (error) {
      console.error(`❌ Error reading file: ${filePath}`);
    }
  }
  
  // Print report
  printReport(allViolations, allPremiumFeatures, filePaths.length);
  
  // Exit with error code if violations found
  // if (allViolations.length > 0) {
  //   process.exit(1);
  // }
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
        // Only check HTML, CSS, JS, JSX, TSX files
        if (['.html', '.css', '.js', '.jsx', '.tsx', '.ts'].includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dirPath);
  return files;
}

// Run
main();
