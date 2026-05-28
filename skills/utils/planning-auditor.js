#!/usr/bin/env node

/**
 * Avant-Garde Design OS - L5 SWE Programmatic Planning Auditor
 * Zero-dependency parser that reads and validates the structure, trade-off matrix,
 * threat-models, and interface contracts of the agent's l5-planning.md file.
 * Returns Exit Code 0 on compliance, and Exit Code 1 on slop/insufficient planning.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.join(process.cwd(), '.vg-canvas');
const PLANNING_DIR = path.join(WORKSPACE_DIR, 'planning');
const PLANNING_FILE = path.join(PLANNING_DIR, 'l5-planning.md');
const FALLBACK_PLANNING_FILE = path.join(WORKSPACE_DIR, 'l5-planning.md');

// Helper to ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
  if (!fs.existsSync(PLANNING_DIR)) {
    fs.mkdirSync(PLANNING_DIR, { recursive: true });
  }
}

// Write a starter L5 planning template if none exists
function writePlanningTemplate(destPath) {
  const template = `# 🏛️ SWE-L5 Engineering Design Document

## 1. Multi-Path Evaluation
Please evaluate three distinct architectural paths:
*   **Path A (Simplicity-First):** Lightweight, zero-dependency, fastest to deploy, but harder to scale.
*   **Path B (Scale/Robustness-First):** Modular, highly structured, heavily typed, but higher initial complexity.
*   **Path C (Extreme Performance/Edge-First):** Compute-optimized, low memory, but potentially higher maintenance overhead.

| Path Options | Architectural Complexity | Maintainability Index | Failure Mode Resistance | Latency/Performance | Average Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Path A (Simple) | 5 | 4 | 2 | 3 | 3.5 |
| Path B (Robust) | 2 | 5 | 5 | 4 | 4.0 |
| Path C (Performance) | 1 | 2 | 4 | 5 | 3.0 |

*Double-click cells or edit columns to adjust metrics.*

## 2. Selected Path Rationale
- **Chosen:** Path B (Robustness-First)
- **Trade-off justification:** The modular robustness and failure-mode resistance outweigh the initial design complexity, ensuring a production-grade interface.

## 3. Defensive Threat-Model
- **Failure 1 (Network Timeout / CDN Offline):** -> **Mitigation:** Gracefully fall back to local cached system assets.
- **Failure 2 (Input Bounding Violation):** -> **Mitigation:** Integrate JSON schema bounds checking at structural entrances.
- **Failure 3 (Concurrency Race Condition):** -> **Mitigation:** Enforce atomic filesystem locks inside task queues.

## 4. Contract Specifications
- **Interface/API contract:**
  * Inputs: \`userId: UUIDv4\`, \`canvasState: StateObject\`
  * Outputs: \`compiledHtml: String\`, \`statusCode: 200|400|500\`
- **State Lifecycle:** \`idle\` -> \`planning\` -> \`compiling\` -> \`success|error\`

## 5. Peer Critique & Mutations
- **SRE Review Comments:** Catch race condition in concurrent compiler calls. Add defensive locks.
- **Applied Plan Modifications:** Integrated atomic locks in Pass 3 to address SRE concerns.
`;
  fs.writeFileSync(destPath, template, 'utf8');
}

function main() {
  ensureDirs();

  let targetFile = PLANNING_FILE;
  if (!fs.existsSync(targetFile)) {
    if (fs.existsSync(FALLBACK_PLANNING_FILE)) {
      targetFile = FALLBACK_PLANNING_FILE;
    } else {
      // Generate a starter template so the agent can learn and edit it
      writePlanningTemplate(PLANNING_FILE);
      console.log(`\n❌ [L5_PLAN_FAIL] Fatal: L5 SWE Design Document missing!`);
      console.log(`📁 A starter L5 SWE Planning template has been generated at:`);
      console.log(`   👉 ${PLANNING_FILE}`);
      console.log(`*AI Agent: You are STRICTLY BLOCKED from coding until you fill out the trade-off matrix and threat-model inside this design document!*`);
      process.exit(1);
    }
  }

  console.log(`\n=============================================================`);
  console.log(`🤖 AVANT-GARDE L5 SWE PROGRAMMATIC PLANNING AUDITOR`);
  console.log(`📁 Target Document: "${path.basename(targetFile)}"`);
  console.log(`=============================================================\n`);

  try {
    const content = fs.readFileSync(targetFile, 'utf8');
    const logs = [];
    let isCompliant = true;

    // 1. Multi-Path Evaluation Check
    const hasMultiPathHeader = /## 1\.\s+Multi-Path|#+\s+.*Multi-Path/i.test(content);
    const hasMarkdownTable = /\|.*\|.*\n\s*\|[\s:-|]+\|\n\s*\|.*\|/i.test(content) || /\|.*Path Options.*\|/i.test(content);
    
    if (!hasMultiPathHeader) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing "## 1. Multi-Path Evaluation" heading.');
    }
    if (!hasMarkdownTable) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing Multi-Path Trade-Off Scoring table matrix. You must document scoring metrics.');
    }

    // 2. Chosen Path Rationale Check
    const hasRationaleHeader = /## 2\.\s+Selected Path|#+\s+.*Selected Path/i.test(content);
    const hasChosenDeclaration = /-?\s*\*\*Chosen:\*\*\s*\w+/i.test(content) || /Chosen\s*:/i.test(content);
    
    if (!hasRationaleHeader) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing "## 2. Selected Path Rationale" heading.');
    }
    if (!hasChosenDeclaration) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing specific chosen path declaration (e.g. - **Chosen:** Path B).');
    }

    // 3. Defensive Threat-Model Check
    const hasThreatHeader = /## 3\.\s+Defensive Threat|#+\s+.*Defensive Threat/i.test(content);
    const failureCount = (content.match(/Failure\s*\d|Mitigation/gi) || []).length;
    
    if (!hasThreatHeader) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing "## 3. Defensive Threat-Model" heading.');
    }
    if (failureCount < 4) { // Needs at least a few instances of Failure and Mitigation
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Insufficient threat modeling. You must list at least 3 failure boundaries (Failure 1, 2, 3) and their code-level Mitigations.');
    }

    // 4. Contract Specifications Check
    const hasContractHeader = /## 4\.\s+Contract Specifications|#+\s+.*Contract Specifications/i.test(content);
    const hasSchemas = /Inputs|Outputs|State\s*Lifecycle|contract/i.test(content);
    
    if (!hasContractHeader) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing "## 4. Contract Specifications" heading.');
    }
    if (!hasSchemas) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing strict Interface / API contracts or State Lifecycle definitions.');
    }

    // 5. Peer Critique & Mutations Check
    const hasCritiqueHeader = /## 5\.\s+Peer Critique|#+\s+.*Peer Critique/i.test(content);
    const hasSreCritique = /SRE|Breaker|Critique|Modification/i.test(content);
    
    if (!hasCritiqueHeader) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing "## 5. Peer Critique & Mutations" heading.');
    }
    if (!hasSreCritique) {
      isCompliant = false;
      logs.push('❌ [PLAN_ERROR] Missing Split-Brain peer critique notes. Document Pass 2 SRE concerns and your Pass 3 mutations.');
    }

    // Print results
    if (isCompliant) {
      console.log('✅ [PLAN_COMPLIANT] L5 SWE Design Document passes all structural and completeness audits!');
      console.log('✨ Your planning is thorough, trade-off matrix is detailed, and threat-boundaries are solid.');
      console.log('🚀 Proceeding to compilation...\n');
      process.exit(0);
    } else {
      console.log('❌ [PLAN_DEFIANT] L5 SWE Design Document failed compliance checks!');
      console.log('Your planning file lacks critical architectural reasoning points:\n');
      logs.forEach(log => console.log(log));
      console.log(`\n📁 Please open and complete:`);
      console.log(`   👉 ${targetFile}`);
      console.log(`\n*AI Agent: Modify this planning file to resolve every error. You are BLOCKED from writing code until the auditor passes!*\n`);
      process.exit(1);
    }

  } catch (err) {
    console.error(`[Planning Auditor Failure] Failed to parse file: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
