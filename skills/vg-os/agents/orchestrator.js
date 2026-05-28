/**
 * Avant-Garde Design OS - Cognitive Subagent Mesh Orchestrator (vg-agents)
 * Zero-dependency shared-filesystem queue manager and context switcher.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.join(process.cwd(), '.vg-canvas');
const AGENTS_DIR = path.join(WORKSPACE_DIR, 'agents');
const TASKS_FILE = path.join(AGENTS_DIR, 'tasks.json');
const STATE_FILE = path.join(WORKSPACE_DIR, 'state.json');

// Subagent Prompts & Personas
const PERSONAS = {
  researcher: {
    title: 'Avant-Garde Lead Design Researcher',
    avatar: '🔍',
    mission: 'Analyze typography scales, search royalty-free visual assets, map design tones, and audit accessibility baselines.',
    systemOverride: `You are the Lead Design Researcher of the Avant-Garde OS. 
Your core responsibility is to inspect the design task, query fonts, search visual themes, and establish the visual design parameters.
Avoid generic choices. Use OKLCH color spaces, precise semantic tokens, and high-quality typography.
You have native access to CLI search tools:
- Search elements: 'node skills/utils/search.js --elements "<query>"'
- Search fonts: 'node skills/utils/search.js --fonts "<query>"'
- Search images: 'node skills/utils/search.js --images "<query>"'`
  },
  designer: {
    title: 'Avant-Garde Head of UI Layout & Coordinates',
    avatar: '📐',
    mission: 'Draft spatial grids, calculate vector coordinates (X, Y, W, H), declare gradient paint stops, and map responsive containers.',
    systemOverride: `You are the Head UI/UX Layout Designer of the Avant-Garde OS. 
Your core responsibility is to calculate precise absolute coordinates for vector layers to draft beautiful, balanced bento cards, buttons, or typography text.
Keep all positions aligned to the 8px grid. Ensure interactive layers (buttons, inputs) satisfy the minimum 44x44px target bounds.
Draft elements using standard coordinates:
- Rectangles: { x, y, w, h, fill, radius, blur, interactive }
- Text: { x, y, w, h, content, font, size, weight, color, align }
Gradients: Linear/Radial paint definitions.`
  },
  auditor: {
    title: 'Avant-Garde Spatial Integrity & APCA Contrast Auditor',
    avatar: '🛡️',
    mission: 'Calculate visual centroids, verify 8px alignments, perform relative APCA text readability contrast audits, and flag collisions.',
    systemOverride: `You are the QA Auditor of the Avant-Garde OS.
Your core responsibility is to analyze spatial layouts, verify overlapping layers, evaluate negative space percentages, and calculate APCA contrast scores.
Enforce WCAG 2.2 AA and Advanced APCA reading standards (>75 Lc for body, >60 Lc for display text). 
Highlight overlapping layers on the same Z-index, off-grid dimensions, or cluttered visual weights.`
  }
};

// Helper: Ensure task structures exist
function ensureAgentDirs() {
  if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

// Helper: Load all subagent tasks
function loadTasks() {
  ensureAgentDirs();
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

// Helper: Save tasks
function saveTasks(tasks) {
  ensureAgentDirs();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// Generate Markdown Handoff file for a subagent role
function createHandoff(role, taskDescription) {
  ensureAgentDirs();
  const persona = PERSONAS[role.toLowerCase()];
  if (!persona) throw new Error(`Role "${role}" is not registered in the subagent system.`);

  // Load current canvas state
  let canvasState = {};
  if (fs.existsSync(STATE_FILE)) {
    try {
      canvasState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {}
  }

  const handoffPath = path.join(AGENTS_DIR, `handoff-${role.toLowerCase()}.md`);

  const mdContent = `# 🛠️ Cognitive Handoff Packet: ${persona.title} ${persona.avatar}

> **PLATFORM MESSAGE**: You are currently operating inside the **Avant-Garde OS Subagent Mesh**. Your master coordinator has suspended their current process and routed execution to you to resolve this isolated task.

---

## 🎭 Subagent Persona Overrides
- **Title**: ${persona.title}
- **Mission**: ${persona.mission}
- **Standard Guidelines**: 
  ${persona.systemOverride}

---

## 🌐 Current Canvas State
Below is the active coordinate-based drawing canvas state (\`state.json\`):
\`\`\`json
${JSON.stringify(canvasState, null, 2)}
\`\`\`

---

## 🎯 Task Assignment
Please complete the following specific directive:
> **${taskDescription}**

---

## 📥 Subagent Deliverables Guidelines
To return execution control back to the master coordinator, you MUST write your output inside the special fenced block below. Do not modify the boundary comments.

<!-- START DELIVERABLES -->
[Delete this text and write your complete CSS code, FigmaML coordinates structure, or design recommendations here]
<!-- END DELIVERABLES -->

---
*Created on: ${new Date().toISOString()} | Handoff Token: ${Math.random().toString(36).substring(7)}*
`;

  fs.writeFileSync(handoffPath, mdContent, 'utf8');

  // Add task to tasks queue
  const tasks = loadTasks();
  const taskId = `${role.toLowerCase()}-${Date.now()}`;
  tasks.push({
    id: taskId,
    role: role.toLowerCase(),
    title: persona.title,
    avatar: persona.avatar,
    task: taskDescription,
    status: 'ACTIVE',
    created: new Date().toISOString(),
    completed: null,
    handoffPath: handoffPath
  });
  saveTasks(tasks);

  return { taskId, handoffPath };
}

// Parse completed handoff packet file and integrate output
function completeHandoff(role, optionalTextOutput = '') {
  ensureAgentDirs();
  const handoffPath = path.join(AGENTS_DIR, `handoff-${role.toLowerCase()}.md`);
  if (!fs.existsSync(handoffPath)) {
    throw new Error(`Handoff file not found at: ${handoffPath}`);
  }

  const content = fs.readFileSync(handoffPath, 'utf8');
  const startTag = '<!-- START DELIVERABLES -->';
  const endTag = '<!-- END DELIVERABLES -->';

  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Invalid handoff deliverables boundaries. Start/End tags are missing.');
  }

  let extracted = content.substring(startIdx + startTag.length, endIdx).trim();
  
  // Use fallback argument output if file contents weren't modified yet (handy for testing)
  if ((extracted.startsWith('[Delete this text') || !extracted) && optionalTextOutput) {
    extracted = optionalTextOutput;
  }

  // Update task queue status
  const tasks = loadTasks();
  const activeTask = tasks.find(t => t.role === role.toLowerCase() && t.status === 'ACTIVE');
  if (activeTask) {
    activeTask.status = 'COMPLETED';
    activeTask.completed = new Date().toISOString();
    activeTask.outputSnippet = extracted;
    saveTasks(tasks);
  }

  return {
    success: true,
    role: role.toLowerCase(),
    deliverables: extracted
  };
}

module.exports = {
  createHandoff,
  completeHandoff,
  loadTasks,
  saveTasks,
  PERSONAS
};
