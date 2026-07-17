#!/usr/bin/env node
/**
 * Visual Contract Checker
 * Validates locally stored design-reference and 3D-scene contracts. This is a
 * metadata audit, not a substitute for browser screenshots or human review.
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_REFERENCE = ['id', 'source', 'license', 'title', 'media', 'visual_traits', 'breakpoints', 'performance_budget', 'accessibility_notes'];
const REQUIRED_SCENE = ['id', 'title', 'license', 'files', 'fallback', 'user_preferences', 'performance_budget'];
const VALID_SOURCES = new Set(['first-party', 'commissioned', 'public-domain', 'permissive-license']);
const LICENSE_RE = /^(CC0-1\.0|CC-BY-4\.0|MIT|Apache-2\.0|OFL-1\.1|proprietary-owned)$/;

function parseArgs(args) {
  const result = { assets: 'assets', json: false };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--assets') result.assets = args[++i];
    else if (args[i] === '--json') result.json = true;
    else if (args[i] === '--help' || args[i] === '-h') result.help = true;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  return result;
}
function readJson(file, errors) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { errors.push({ file, message: `Invalid JSON: ${error.message}` }); return null; }
}
function existingFile(base, relative, file, errors, field) {
  if (typeof relative !== 'string' || !relative) {
    errors.push({ file, message: `${field} must be a non-empty relative path` }); return;
  }
  const resolved = path.resolve(base, relative);
  if (!resolved.startsWith(`${path.resolve(base)}${path.sep}`) || !fs.existsSync(resolved)) {
    errors.push({ file, message: `${field} does not resolve to a local file: ${relative}` });
  }
}
function requireFields(data, fields, file, errors) {
  fields.forEach((field) => { if (data[field] === undefined || data[field] === null || data[field] === '') errors.push({ file, message: `Missing required field: ${field}` }); });
}
function validateReference(file, data, errors, warnings) {
  requireFields(data, REQUIRED_REFERENCE, file, errors);
  if (!VALID_SOURCES.has(data.source)) errors.push({ file, message: `source must be one of: ${[...VALID_SOURCES].join(', ')}` });
  if (!LICENSE_RE.test(data.license || '')) errors.push({ file, message: 'license must be a recognized reusable or owned license identifier' });
  if (!Array.isArray(data.media) || data.media.length === 0) errors.push({ file, message: 'media must contain at least one asset' });
  else data.media.forEach((item, index) => existingFile(path.dirname(file), item.path, file, errors, `media[${index}].path`));
  if (!Array.isArray(data.breakpoints) || data.breakpoints.length < 2) warnings.push({ file, message: 'Provide at least two breakpoint captures (for example mobile and desktop).' });
  ['initial_js_kb', 'target_fps'].forEach((field) => {
    if (!Number.isFinite(data.performance_budget?.[field]) || data.performance_budget[field] <= 0) errors.push({ file, message: `performance_budget.${field} must be a positive number` });
  });
  if (!Array.isArray(data.accessibility_notes) || data.accessibility_notes.length === 0) errors.push({ file, message: 'accessibility_notes must contain concrete behavior notes' });
}
function validateScene(file, data, errors, warnings) {
  requireFields(data, REQUIRED_SCENE, file, errors);
  if (!LICENSE_RE.test(data.license || '')) errors.push({ file, message: 'license must be a recognized reusable or owned license identifier' });
  existingFile(path.dirname(file), data.files?.poster, file, errors, 'files.poster');
  existingFile(path.dirname(file), data.fallback?.asset, file, errors, 'fallback.asset');
  if (!data.fallback?.semantic_html) errors.push({ file, message: 'fallback.semantic_html is required so the scene is not the only content' });
  ['reduced_motion', 'webgl_unavailable', 'low_power'].forEach((field) => {
    if (!data.user_preferences?.[field]) errors.push({ file, message: `user_preferences.${field} is required` });
  });
  ['model_compressed_kb', 'texture_max_px', 'draw_calls', 'target_fps'].forEach((field) => {
    if (!Number.isFinite(data.performance_budget?.[field]) || data.performance_budget[field] <= 0) errors.push({ file, message: `performance_budget.${field} must be a positive number` });
  });
  if (!data.files?.model) warnings.push({ file, message: 'No interactive model is declared; this may intentionally be a poster-first scene.' });
  else existingFile(path.dirname(file), data.files.model, file, errors, 'files.model');
}
function findContracts(root, filename) {
  if (!fs.existsSync(root)) return [];
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const item = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...findContracts(item, filename));
    else if (entry.name === filename) found.push(item);
  }
  return found;
}
function main() {
  let options;
  try { options = parseArgs(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exit(2); }
  if (options.help) { console.log('Usage: node skills/utils/visual-contract-checker.js [--assets assets] [--json]'); return; }
  const assets = path.resolve(options.assets);
  const errors = [], warnings = [];
  const referenceFiles = findContracts(path.join(assets, 'references'), 'reference.json');
  const sceneFiles = findContracts(path.join(assets, '3d'), 'scene.json');
  if (referenceFiles.length + sceneFiles.length === 0) errors.push({ file: assets, message: 'No reference.json or scene.json contracts found' });
  referenceFiles.forEach((file) => { const data = readJson(file, errors); if (data) validateReference(file, data, errors, warnings); });
  sceneFiles.forEach((file) => { const data = readJson(file, errors); if (data) validateScene(file, data, errors, warnings); });
  const report = { valid: errors.length === 0, references: referenceFiles.length, scenes: sceneFiles.length, errors, warnings, limitation: 'Contract validation checks metadata and local files only. Run browser screenshots, accessibility checks, and human visual review before release.' };
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Visual contracts: ${report.references} reference(s), ${report.scenes} scene(s)`);
    warnings.forEach((item) => console.log(`WARN  ${item.file}: ${item.message}`));
    errors.forEach((item) => console.log(`ERROR ${item.file}: ${item.message}`));
    console.log(report.valid ? 'PASS — contracts are valid. Rendered visual quality is not asserted.' : 'FAIL — repair contract errors before using these assets.');
  }
  process.exitCode = report.valid ? 0 : 1;
}
main();
