#!/usr/bin/env node
/**
 * Reference-to-Code starter generator.
 * It analyzes authorized PNG screenshots for palette and focal-weight hints,
 * then creates a semantic, responsive reconstruction starter. It cannot infer
 * hidden DOM, fonts, assets, behavior, or guarantee pixel-exact output.
 */
const fs = require('fs');
const path = require('path');
const { parsePNG, analyzeAndVisualize } = require('./image-analyzer');

function usage() {
  console.log('Usage: node skills/utils/reference-to-code.js --image <authorized.png> --output <directory> [--title "Page title"]');
}
function args(argv) {
  const out = { title: 'Reference reconstruction' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--image') out.image = argv[++i];
    else if (argv[i] === '--output') out.output = argv[++i];
    else if (argv[i] === '--title') out.title = argv[++i];
    else if (argv[i] === '--help' || argv[i] === '-h') out.help = true;
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  return out;
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function rgb(value) { return value.match(/rgb\((\d+), (\d+), (\d+)\)/).slice(1).map(Number); }
function hex(value) { return `#${value.map((part) => part.toString(16).padStart(2, '0')).join('')}`; }
function scaffold(title, palette, focus) {
  const [background, surface, accent] = palette;
  const titleSafe = escapeHtml(title);
  const focusClass = focus.horizontalFocus === 'Left' ? 'focus-left' : focus.horizontalFocus === 'Right' ? 'focus-right' : 'focus-center';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titleSafe}</title>
  <style>
    :root { --ink: ${background}; --surface: ${surface}; --accent: ${accent}; --paper: #fffaf2; --muted: color-mix(in srgb, var(--paper) 68%, var(--ink)); }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--ink); color: var(--paper); font: 400 1rem/1.55 system-ui, sans-serif; }
    a { color: inherit; }
    :focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
    .shell { width: min(100% - 2rem, 76rem); margin-inline: auto; padding-block: 1.25rem 4rem; }
    header { display: flex; justify-content: space-between; align-items: center; min-height: 3rem; }
    .eyebrow { color: var(--muted); font-size: .75rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
    main { display: grid; align-items: center; gap: clamp(2rem, 8vw, 8rem); min-height: 72vh; padding-block: clamp(3rem, 9vw, 8rem); }
    .focus-left main { grid-template-columns: 1.15fr .85fr; } .focus-right main { grid-template-columns: .85fr 1.15fr; } .focus-center main { text-align: center; justify-items: center; }
    h1 { max-width: 10ch; margin: .4rem 0 1rem; font: 500 clamp(3.1rem, 8vw, 7.5rem)/.92 Georgia, serif; letter-spacing: -.055em; }
    p { max-width: 54ch; margin: 0; color: var(--muted); }
    .actions { display: flex; flex-wrap: wrap; gap: .8rem; margin-top: 1.75rem; }
    .button { display: inline-flex; min-height: 44px; align-items: center; padding: .65rem 1rem; border: 1px solid var(--accent); border-radius: 999px; background: var(--accent); color: #18120d; font-weight: 750; text-decoration: none; }
    .visual { aspect-ratio: 1 / 1; width: min(100%, 34rem); border-radius: 42% 58% 47% 53% / 51% 43% 57% 49%; background: radial-gradient(circle at 35% 30%, var(--accent), transparent 34%), linear-gradient(135deg, color-mix(in srgb, var(--surface) 85%, white), var(--surface)); box-shadow: 0 2rem 6rem color-mix(in srgb, var(--accent) 28%, transparent); }
    @media (max-width: 48rem) { main, .focus-left main, .focus-right main { grid-template-columns: 1fr; min-height: auto; } .visual { order: -1; width: min(78vw, 27rem); } }
    @media (prefers-reduced-motion: no-preference) { .button { transition: transform 180ms ease-out, box-shadow 180ms ease-out; } .button:hover { transform: translateY(-2px); box-shadow: 0 .7rem 1.5rem color-mix(in srgb, var(--accent) 25%, transparent); } }
  </style>
</head>
<body class="${focusClass}">
  <div class="shell">
    <header><a class="eyebrow" href="#content">${titleSafe}</a><a href="#contact">Contact</a></header>
    <main id="content">
      <section aria-labelledby="page-title"><p class="eyebrow">Reconstruction starter</p><h1 id="page-title">Replace this with the reference’s verified message.</h1><p>Use the screenshot as visual evidence, not as a source of hidden semantics. Replace this copy, select licensed fonts and assets, then compare rendered output at each target breakpoint.</p><div class="actions"><a class="button" href="#contact">Primary action</a><a href="#details">Secondary action</a></div></section>
      <div class="visual" role="img" aria-label="Abstract visual placeholder; replace with an authorized asset from the reference."></div>
    </main>
  </div>
</body>
</html>`;
}
function main() {
  let options;
  try { options = args(process.argv.slice(2)); } catch (error) { console.error(error.message); usage(); process.exit(2); }
  if (options.help) return usage();
  if (!options.image || !options.output) { usage(); process.exit(2); }
  if (path.extname(options.image).toLowerCase() !== '.png') { console.error('Only PNG input is supported by the zero-dependency analyzer. Convert authorized images to PNG first.'); process.exit(2); }
  if (!fs.existsSync(options.image)) { console.error(`Image not found: ${options.image}`); process.exit(2); }
  const png = parsePNG(fs.readFileSync(options.image));
  const analysis = analyzeAndVisualize(png);
  const palette = analysis.sortedColors.map((entry) => hex(rgb(entry.rgb)));
  while (palette.length < 3) palette.push('#8b5e3c');
  const out = path.resolve(options.output);
  fs.mkdirSync(out, { recursive: true });
  const brief = {
    schema_version: '1.0', title: options.title, input: { path: path.resolve(options.image), format: 'png', dimensions: `${png.width}x${png.height}`, authorization_required: true },
    observed_signals: { average_luminance_percent: analysis.avgLuminance, focal_weight: `${analysis.verticalFocus}-${analysis.horizontalFocus}`, dominant_palette: palette },
    limitations: ['No OCR or DOM/component inference is performed.', 'A screenshot cannot reveal responsive rules, interactions, font files, asset licensing, or accessibility semantics.', 'The generated HTML is a semantic starter, not an exact reproduction.'],
    required_next_steps: ['Record the reference source and permission.', 'Replace placeholder content with verified semantic copy.', 'Render at the reference viewport and compare screenshots.', 'Repair geometry, typography, and assets iteratively.', 'Run keyboard, reduced-motion, contrast, performance, and licensing review.']
  };
  fs.writeFileSync(path.join(out, 'reconstruction-brief.json'), `${JSON.stringify(brief, null, 2)}\n`);
  fs.writeFileSync(path.join(out, 'index.html'), scaffold(options.title, palette, analysis));
  fs.writeFileSync(path.join(out, 'README.md'), `# ${options.title}\n\nGenerated from an authorized PNG by \`reference-to-code.js\`. This is a reconstruction starter, not pixel-exact image-to-code output. Read \`reconstruction-brief.json\`, then iterate using rendered screenshots.\n`);
  console.log(`Created reconstruction starter in ${out}`);
}
main();
