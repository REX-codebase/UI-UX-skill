#!/usr/bin/env node

/**
 * Avant-Garde Design OS - System 2 Slow-Thinking Coordinator (vg-taste)
 * Zero-dependency state manager that coordinates deliberate planning clocks,
 * multi-turn thought cycle milestones, and persistent thought buffers.
 * Blocks execution with Exit Code 1 if cognitive parameters are not satisfied.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.join(process.cwd(), '.vg-canvas');
const PLANNING_DIR = path.join(WORKSPACE_DIR, 'planning');
const BUFFER_FILE = path.join(PLANNING_DIR, 'thought-buffer.json');
const L5_PLAN_FILE = path.join(PLANNING_DIR, 'l5-planning.md');

function ensureDirs() {
  if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  if (!fs.existsSync(PLANNING_DIR)) fs.mkdirSync(PLANNING_DIR, { recursive: true });
}

// Ingest current task status or initialize a new System 2 buffer
function initTask(taskDescription, timeLimitMinutes = 3) {
  ensureDirs();
  const limitMs = timeLimitMinutes * 60 * 1000;
  const buffer = {
    taskId: `task-${Date.now()}`,
    task: taskDescription,
    startTime: Date.now(),
    deliberationTimeLimitMs: limitMs,
    currentCycle: 1,
    mandatoryCycles: 3,
    milestones: {
      cycle1_research: {
        status: 'PENDING',
        required_action: "Run 'node cli.js search web' or 'node cli.js search elements' to research parameters, then run 'node cli.js task complete --cycle 1 --findings \"<text>\"' to complete.",
        findings: ''
      },
      cycle2_simulation: {
        status: 'PENDING',
        required_action: "Draft coordinates for Draft A & Draft B in l5-planning.md, then run 'node cli.js task complete --cycle 2' to complete.",
        drafts_declared: false
      },
      cycle3_threat_model: {
        status: 'PENDING',
        required_action: "Identify 3 failure modes & mitigations in l5-planning.md, then run 'node cli.js task complete --cycle 3' to complete.",
        mitigations_declared: false
      }
    }
  };

  fs.writeFileSync(BUFFER_FILE, JSON.stringify(buffer, null, 2), 'utf8');
  return buffer;
}

// Loads thought buffer
function loadBuffer() {
  ensureDirs();
  if (fs.existsSync(BUFFER_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(BUFFER_FILE, 'utf8'));
    } catch (e) {}
  }
  return null;
}

// Saves thought buffer
function saveBuffer(buffer) {
  ensureDirs();
  fs.writeFileSync(BUFFER_FILE, JSON.stringify(buffer, null, 2), 'utf8');
}

// Validate planning clock & thought cycles
function validateThoughtState(bypassClock = false) {
  const buffer = loadBuffer();
  if (!buffer) {
    console.log(`\n❌ [SYSTEM2_FAIL] Fatal: No active thought buffer found.`);
    console.log(`📁 You must initialize an L5 design task before compiling or testing:`);
    console.log(`   👉 node cli.js task init --task "<description>" [--time <minutes>]`);
    console.log(`*AI Agent: You are STRICTLY BLOCKED from coding until a thought buffer is initialized!*`);
    process.exit(1);
  }

  // 1. Audit Deliberate Planning Clock
  const elapsed = Date.now() - buffer.startTime;
  if (elapsed < buffer.deliberationTimeLimitMs && !bypassClock) {
    const remainingSeconds = Math.ceil((buffer.deliberationTimeLimitMs - elapsed) / 1000);
    console.log(`\n=============================================================`);
    console.log(`❌ [SYSTEM2_CLOCK_FAIL] DELIBERATE PLANNING CLOCK LOCKED!`);
    console.log(`=============================================================`);
    console.log(`- Required deliberation time: ${buffer.deliberationTimeLimitMs / 1000}s`);
    console.log(`- Current elapsed time: ${Math.floor(elapsed / 1000)}s`);
    console.log(`- Remaining clock lock: ${remainingSeconds} seconds`);
    console.log(`\n*AI Agent: Slow down! You are programmatically blocked from coding. Use this time to explore alternative coordinate mockups, evaluate font weights, or query design elements!*`);
    process.exit(1);
  }

  // 2. Audit Turn Milestones
  if (buffer.currentCycle === 1 && buffer.milestones.cycle1_research.status !== 'COMPLETED') {
    console.log(`\n=============================================================`);
    console.log(`❌ [SYSTEM2_CYCLE_FAIL] THOUGHT CYCLE 1 (RESEARCH) PENDING!`);
    console.log(`=============================================================`);
    console.log(`- Required Action: ${buffer.milestones.cycle1_research.required_action}`);
    console.log(`\n*AI Agent: Research is mandatory! Query overrated fonts or search elements, then run 'node cli.js task complete --cycle 1 --findings \"<text>\"' to proceed.*`);
    process.exit(1);
  }

  if (buffer.currentCycle === 2 && buffer.milestones.cycle2_simulation.status !== 'COMPLETED') {
    console.log(`\n=============================================================`);
    console.log(`❌ [SYSTEM2_CYCLE_FAIL] THOUGHT CYCLE 2 (SIMULATION) PENDING!`);
    console.log(`=============================================================`);
    console.log(`- Required Action: ${buffer.milestones.cycle2_simulation.required_action}`);
    console.log(`\n*AI Agent: You must draft Draft A & B coordinates in your l5-planning.md document, then run 'node cli.js task complete --cycle 2' to proceed.*`);
    process.exit(1);
  }

  if (buffer.currentCycle === 3 && buffer.milestones.cycle3_threat_model.status !== 'COMPLETED') {
    console.log(`\n=============================================================`);
    console.log(`❌ [SYSTEM2_CYCLE_FAIL] THOUGHT CYCLE 3 (THREAT-MODEL) PENDING!`);
    console.log(`=============================================================`);
    console.log(`- Required Action: ${buffer.milestones.cycle3_threat_model.required_action}`);
    console.log(`\n*AI Agent: You must outline exactly 3 failures and mitigations in l5-planning.md, then run 'node cli.js task complete --cycle 3' to proceed.*`);
    process.exit(1);
  }

  console.log(`\n=============================================================`);
  console.log(`🧠 [SYSTEM2_COMPLIANT] THOUGHT CYCLES COMPLETED SUCCESSFUL`);
  console.log(`- Active Task: "${buffer.task}"`);
  console.log(`- Deliberation time: ${Math.floor(elapsed / 60000)}m ${Math.floor((elapsed % 60000) / 1000)}s satisfied.`);
  console.log(`=============================================================`);
  return true;
}

// Complete a thought cycle programmatically
function completeCycle(cycleNumber, findings = '') {
  const buffer = loadBuffer();
  if (!buffer) {
    console.error('Error: No active task thought buffer found.');
    process.exit(1);
  }

  const cycle = parseInt(cycleNumber, 10);
  if (cycle === 1) {
    if (!findings || findings.length < 10) {
      console.error('Error: Please provide detailed research findings (--findings "<text>"). minimum 10 characters.');
      process.exit(1);
    }
    buffer.milestones.cycle1_research.status = 'COMPLETED';
    buffer.milestones.cycle1_research.findings = findings;
    buffer.currentCycle = 2;
    console.log(`\n✅ [CYCLE_1_COMPLETE] Research logged! Findings: "${findings}"`);
    console.log(`👉 Advanced to Thought Cycle 2: Visual Centroid Simulation.`);
  } else if (cycle === 2) {
    // Validate that the l5-planning file exists and contains coordinate details
    if (!fs.existsSync(L5_PLAN_FILE)) {
      console.error(`Error: l5-planning.md missing! Please run 'node cli.js compile' to generate a starter template, then draft coordinates.`);
      process.exit(1);
    }
    const planningText = fs.readFileSync(L5_PLAN_FILE, 'utf8');
    if (!planningText.includes('Path A') || !planningText.includes('Path B')) {
      console.error('Error: Please specify the Multi-Path scoring drafts (Path A, B) inside l5-planning.md before completing Cycle 2.');
      process.exit(1);
    }
    buffer.milestones.cycle2_simulation.status = 'COMPLETED';
    buffer.milestones.cycle2_simulation.drafts_declared = true;
    buffer.currentCycle = 3;
    console.log(`\n✅ [CYCLE_2_COMPLETE] Visual coordinate drafts validated!`);
    console.log(`👉 Advanced to Thought Cycle 3: SRE Threat-Boundary Mitigation.`);
  } else if (cycle === 3) {
    if (!fs.existsSync(L5_PLAN_FILE)) {
      console.error('Error: l5-planning.md missing!');
      process.exit(1);
    }
    const planningText = fs.readFileSync(L5_PLAN_FILE, 'utf8');
    if (!planningText.includes('Failure 1') || !planningText.includes('Mitigation')) {
      console.error('Error: Please define your 3 failure scenarios and mitigations inside l5-planning.md before completing Cycle 3.');
      process.exit(1);
    }
    buffer.milestones.cycle3_threat_model.status = 'COMPLETED';
    buffer.milestones.cycle3_threat_model.mitigations_declared = true;
    buffer.currentCycle = 4; // Unlocked!
    console.log(`\n✅ [CYCLE_3_COMPLETE] SRE Threat Model mitigations verified!`);
    console.log(`🎉 CONGRATULATIONS! All System 2 Thought Cycles are fully completed.`);
    console.log(`👉 System is unlocked. Run 'node cli.js compile' to build your layout!`);
  } else {
    console.error(`Error: Invalid thought cycle number "${cycle}". Supported: 1, 2, 3.`);
    process.exit(1);
  }

  saveBuffer(buffer);
}

// CLI entry main
function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === 'init') {
    const taskText = args.slice(1).join(' ').replace('--task', '').trim();
    const timeParamIdx = args.indexOf('--time');
    const timeLimit = timeParamIdx !== -1 ? parseInt(args[timeParamIdx + 1], 10) : 3;
    
    const taskName = taskText.split('--time')[0].trim();

    if (!taskName) {
      console.error('Error: Please specify the task description: node slow-thinking.js init "<description>"');
      process.exit(1);
    }

    const buf = initTask(taskName, timeLimit);
    console.log(`\n=============================================================`);
    console.log(`🧠 SYSTEM 2 SLOW-THINKING TASK INITIALIZED`);
    console.log(`- Task: "${buf.task}"`);
    console.log(`- Planning clock budget: ${timeLimit} minutes`);
    console.log(`- Active Cycle: Thought Cycle 1 (Research & Discovery)`);
    console.log(`- Handoff Buffer: ${BUFFER_FILE}`);
    console.log(`=============================================================\n`);
  } else if (cmd === 'status') {
    const buffer = loadBuffer();
    if (!buffer) {
      console.log('No active task thought buffer found. Run "node cli.js task init" to start.');
      return;
    }
    const elapsed = Date.now() - buffer.startTime;
    console.log(`\n=============================================================`);
    console.log(`🧠 SYSTEM 2 ACTIVE THOUGHT BUFFER STATUS`);
    console.log(`- Task Name: "${buffer.task}"`);
    console.log(`- Active Cycle: Thought Cycle ${buffer.currentCycle}/3 (${buffer.currentCycle === 1 ? 'Research' : buffer.currentCycle === 2 ? 'Simulation' : buffer.currentCycle === 3 ? 'Threat-Model' : 'UNLOCKED'})`);
    console.log(`- Deliberation time: ${Math.floor(elapsed / 1000)}s / ${buffer.deliberationTimeLimitMs / 1000}s`);
    console.log(`- Cycle 1 Status: [${buffer.milestones.cycle1_research.status}]`);
    console.log(`- Cycle 2 Status: [${buffer.milestones.cycle2_simulation.status}]`);
    console.log(`- Cycle 3 Status: [${buffer.milestones.cycle3_threat_model.status}]`);
    console.log(`=============================================================\n`);
  } else if (cmd === 'complete') {
    const cycleParamIdx = args.indexOf('--cycle');
    const findingsParamIdx = args.indexOf('--findings');
    
    const cycle = cycleParamIdx !== -1 ? args[cycleParamIdx + 1] : null;
    const findings = findingsParamIdx !== -1 ? args.slice(findingsParamIdx + 1).join(' ') : '';

    if (!cycle) {
      console.error('Error: Please specify the thought cycle number: --cycle <1|2|3>');
      process.exit(1);
    }

    completeCycle(cycle, findings);
  } else if (cmd === 'validate') {
    const bypass = args.includes('--bypass-clock');
    validateThoughtState(bypass);
  } else {
    console.log('Unknown command. Supported: init, status, complete, validate.');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  initTask,
  loadBuffer,
  saveBuffer,
  validateThoughtState,
  completeCycle
};
