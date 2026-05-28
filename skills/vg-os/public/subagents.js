/**
 * Avant-Garde Subagent Mesh Dashboard - Event Controller & Visual Logics
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const agentRoleSelect = document.getElementById('agentRoleSelect');
  const taskDescriptionInput = document.getElementById('taskDescriptionInput');
  const spawnTaskBtn = document.getElementById('spawnTaskBtn');
  const personasRegistryList = document.getElementById('personasRegistryList');
  const agentTasksQueueList = document.getElementById('agentTasksQueueList');
  const handoffViewerBox = document.getElementById('handoffViewerBox');
  const orchestratorConsoleLogs = document.getElementById('orchestratorConsoleLogs');
  
  // Agent Map Nodes
  const nodeOrchestrator = document.getElementById('nodeOrchestrator');
  const nodeResearcher = document.getElementById('nodeResearcher');
  const nodeDesigner = document.getElementById('nodeDesigner');
  const nodeAuditor = document.getElementById('nodeAuditor');
  
  // Connective Link lines
  const linkOrchRes = document.getElementById('linkOrchRes');
  const linkOrchDes = document.getElementById('linkOrchDes');
  const linkOrchAud = document.getElementById('linkOrchAud');
  
  const statusOrchestrator = document.getElementById('statusOrchestrator');
  const statusResearcher = document.getElementById('statusResearcher');
  const statusDesigner = document.getElementById('statusDesigner');
  const statusAuditor = document.getElementById('statusAuditor');

  let activeHandoffRole = null;
  let previousQueueLength = 0;

  // 1. Fetch static subagent personas and register registry
  async function fetchPersonas() {
    try {
      const res = await fetch('/api/agents/personas');
      const personas = await res.json();
      
      personasRegistryList.innerHTML = '';
      Object.keys(personas).forEach(role => {
        const p = personas[role];
        const registryItem = document.createElement('div');
        registryItem.className = 'layer-item';
        registryItem.style.cursor = 'default';
        registryItem.innerHTML = `
          <div class="layer-meta-top">
            <span class="layer-name">${p.avatar} ${p.title}</span>
          </div>
          <div class="layer-coords" style="margin-top:4px; line-height:1.4;">
            ${p.mission}
          </div>
        `;
        personasRegistryList.appendChild(registryItem);
      });
    } catch (e) {
      console.error('Fetch personas failed:', e);
    }
  }

  // 2. Spawn Handoff Task handler
  spawnTaskBtn.addEventListener('click', async () => {
    const role = agentRoleSelect.value;
    const task = taskDescriptionInput.value.trim();

    if (!task) {
      alert('Please describe the task assignment objective.');
      return;
    }

    spawnTaskBtn.innerText = 'Creating Packet...';
    spawnTaskBtn.disabled = true;

    try {
      const res = await fetch('/api/agents/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, task })
      });
      const data = await res.json();
      if (data.taskId) {
        taskDescriptionInput.value = '';
        logConsole('info', `Master initiated handoff to ${role.toUpperCase()}. State written to handoff-${role}.md.`);
        // Instantly reload
        await syncSubagentMesh();
      }
    } catch (e) {
      console.error('Create handoff task failed:', e);
      logConsole('error', `Failed to create handoff task: ${e.message}`);
    } finally {
      spawnTaskBtn.innerText = 'Generate Handoff Packet';
      spawnTaskBtn.disabled = false;
    }
  });

  // 3. Render list of active/completed tasks in shared queue
  function renderTasksQueue(tasks) {
    if (!tasks || tasks.length === 0) {
      agentTasksQueueList.innerHTML = '<div class="empty-layers">No active visual tasks in the shared queue.</div>';
      return;
    }

    // Detect queue addition to append a log
    if (tasks.length > previousQueueLength) {
      const latest = tasks[tasks.length - 1];
      logConsole('info', `New task [${latest.id}] added to queue for ${latest.role.toUpperCase()}.`);
    }
    previousQueueLength = tasks.length;

    agentTasksQueueList.innerHTML = '';
    
    // Render in reverse order to see latest first
    [...tasks].reverse().forEach(task => {
      const card = document.createElement('div');
      card.className = 'layer-item';
      
      const badgeClass = task.status === 'ACTIVE' ? 'status-warning' : 'status-pass';
      
      // Calculate age/time details
      const createdTime = new Date(task.created).toLocaleTimeString();
      
      let actionBtn = '';
      if (task.status === 'ACTIVE') {
        actionBtn = `<button class="btn-primary btn-full simulate-btn" data-role="${task.role}" style="padding:6px 12px; margin-top:10px; font-size:11px;">Simulate Completion</button>`;
      }

      card.innerHTML = `
        <div class="layer-meta-top">
          <span class="layer-name">${task.avatar} ${task.role.toUpperCase()}</span>
          <span class="agent-status-lbl ${badgeClass}">${task.status}</span>
        </div>
        <div class="layer-coords" style="margin-top:6px; line-height:1.4;">
          <strong>Task:</strong> ${task.task}
        </div>
        <div class="layer-coords meta-desc" style="font-size:10px; margin-top:4px;">
          Created at ${createdTime}
        </div>
        ${actionBtn}
      `;

      // Hover/Click to stream raw Markdown
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('simulate-btn')) return; // ignore click on button itself
        streamHandoffMarkdown(task.role);
      });

      // Bind simulator logic
      const simBtn = card.querySelector('.simulate-btn');
      if (simBtn) {
        simBtn.addEventListener('click', () => {
          simulateSubagentCompletion(task.role);
        });
      }

      agentTasksQueueList.appendChild(card);
    });
  }

  // 4. Fetches and renders active Markdown handoff packets
  async function streamHandoffMarkdown(role) {
    activeHandoffRole = role;
    handoffViewerBox.innerText = `Loading handoff-${role}.md file...`;
    try {
      const res = await fetch(`/api/agents/handoff?role=${role}`);
      if (res.status === 404) {
        handoffViewerBox.innerHTML = `<span style="color:var(--semantic-error);">Handoff packet not found. Draw elements or spawn tasks first.</span>`;
        return;
      }
      const rawText = await res.text();
      handoffViewerBox.innerText = rawText;
    } catch (e) {
      handoffViewerBox.innerText = `Failed to stream markdown handoff: ${e.message}`;
    }
  }

  // 5. Simulates a subagent writing output and completing their thread loop
  async function simulateSubagentCompletion(role) {
    logConsole('info', `Simulating execution loops for ${role.toUpperCase()} subagent...`);
    
    // Construct mock visual deliverables based on selected role
    let mockOutput = '';
    if (role === 'designer') {
      const randomId = Math.floor(Math.random() * 1000);
      mockOutput = `<!-- START DELIVERABLES -->
[DESIGN OVERRIDES]
I have created a stylized, glowing Glassmorphic Info Card layout aligned to our 8px visual grid!

node cli.js draw rect --name "dashboard-card-${randomId}" --x 160 --y 160 --w 960 --h 480 --fill "#0f1624" --radius 16 --interactive
node cli.js draw text --name "dashboard-title-${randomId}" --x 200 --y 220 --content "Subagent Design Node Compiled" --size 36 --weight 600 --color "#00f5a0"
<!-- END DELIVERABLES -->`;
    } else if (role === 'researcher') {
      mockOutput = `<!-- START DELIVERABLES -->
[RESEARCH REPORT]
I queried our design elements database and typography catalogs:
- Mood: High-fidelity brutalo-glassmorphic precision.
- Fonts: 'Space Grotesk' for displays, 'Outfit' for UI items.
- Color codes: Cyan accent (#00f5a0) paired with Royal purple (#7f00ff).
Recommended design matches standard WCAG contrast ratios.
<!-- END DELIVERABLES -->`;
    } else if (role === 'auditor') {
      mockOutput = `<!-- START DELIVERABLES -->
[AUDIT VERDICT: PASS]
Calculated visual metrics score: 98/100.
Grid systems align perfectly to 8px tracks.
Text contrast APCA reads -120 Lc (compliant with displays).
Interactive touch bounds are 44x44px. No collisions found.
<!-- END DELIVERABLES -->`;
    }

    try {
      const res = await fetch('/api/agents/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, output: mockOutput })
      });
      const data = await res.json();
      if (data.success) {
        logConsole('info', `Subagent ${role.toUpperCase()} task completed. Delivery details parsed and integrated!`);
        
        // If designer, trigger a draw update from the simulated deliverables
        if (role === 'designer') {
          // Parse drawing lines and run programmatically
          const commandLines = data.deliverables.split('\n').filter(line => line.startsWith('node cli.js'));
          for (const cmd of commandLines) {
            // Re-route the draw commands into the server's update state pipeline!
            // First parse coordinates from draw commands and apply them.
            // Rather than spawning a terminal child here, we can trigger direct CLI compile:
            await executeDrawCommandMock(cmd);
          }
          logConsole('info', `Subagent layout shapes drawn on master coordinate state.`);
        }
        
        // Reload dashboard
        await syncSubagentMesh();
      }
    } catch (e) {
      console.error('Simulate task completion failed:', e);
      logConsole('error', `Failed to complete task: ${e.message}`);
    }
  }

  // Parse simulated CLI draws and apply them directly to state!
  async function executeDrawCommandMock(cmdString) {
    try {
      // Fetch state first
      const stateRes = await fetch('/api/state');
      const state = await stateRes.json();

      // Simple argument parser for Mock draw commands
      const args = cmdString.split(' ');
      const drawIdx = args.indexOf('draw');
      const type = args[drawIdx + 1];
      
      const getVal = (param) => {
        const idx = args.indexOf(param);
        if (idx === -1) return null;
        let val = args[idx + 1];
        if (val.startsWith('"') || val.startsWith("'")) {
          // Join quoted strings
          let merged = [];
          for (let i = idx + 1; i < args.length; i++) {
            merged.push(args[i]);
            if (args[i].endsWith('"') || args[i].endsWith("'")) break;
          }
          val = merged.join(' ').replace(/['"]/g, '');
        }
        return val;
      };

      const name = getVal('--name') || `${type}-${state.layers.length}`;
      const x = parseInt(getVal('--x'), 10) || 0;
      const y = parseInt(getVal('--y'), 10) || 0;
      const w = parseInt(getVal('--w'), 10) || 100;
      const h = parseInt(getVal('--h'), 10) || 100;
      const interactive = args.includes('--interactive');

      const newLayer = { type, name, x, y, w, h, interactive, zIndex: (state.layers.length + 1) * 10 };
      
      if (type === 'rect') {
        newLayer.fill = getVal('--fill') || '#1f2833';
        const radius = getVal('--radius');
        if (radius) newLayer.radius = parseInt(radius, 10);
      } else if (type === 'text') {
        newLayer.content = getVal('--content') || 'Compiled Shape';
        newLayer.size = parseInt(getVal('--size'), 10) || 24;
        newLayer.weight = parseInt(getVal('--weight'), 10) || 400;
        newLayer.color = getVal('--color') || '#ffffff';
        newLayer.font = getVal('--font') || 'Outfit';
      }

      state.layers.push(newLayer);
      
      // Post updated state
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
    } catch (e) {
      console.error('Execute mock draw failed:', e);
    }
  }

  // 6. Coordinates live updates on the SVG mesh map overlay
  function updateVisualMeshState(tasks) {
    // Reset all nodes
    nodeOrchestrator.classList.remove('active');
    nodeResearcher.classList.remove('active');
    nodeDesigner.classList.remove('active');
    nodeAuditor.classList.remove('active');
    
    statusOrchestrator.innerText = 'SYNCED';
    statusResearcher.innerText = 'IDLE';
    statusDesigner.innerText = 'IDLE';
    statusAuditor.innerText = 'IDLE';

    linkOrchRes.classList.remove('active');
    linkOrchDes.classList.remove('active');
    linkOrchAud.classList.remove('active');

    const activeTask = tasks.find(t => t.status === 'ACTIVE');
    
    if (activeTask) {
      // Highlight active executing subagent
      const role = activeTask.role;
      if (role === 'researcher') {
        nodeResearcher.classList.add('active');
        statusResearcher.innerText = 'ACTIVE';
        statusOrchestrator.innerText = 'WAITING';
        linkOrchRes.classList.add('active');
      } else if (role === 'designer') {
        nodeDesigner.classList.add('active');
        statusDesigner.innerText = 'ACTIVE';
        statusOrchestrator.innerText = 'WAITING';
        linkOrchDes.classList.add('active');
      } else if (role === 'auditor') {
        nodeAuditor.classList.add('active');
        statusAuditor.innerText = 'ACTIVE';
        statusOrchestrator.innerText = 'WAITING';
        linkOrchAud.classList.add('active');
      }
    } else {
      // Orchestrator has standard control
      nodeOrchestrator.classList.add('active');
    }
  }

  // Console logging helper
  function logConsole(level, msg) {
    const time = new Date().toLocaleTimeString();
    const prefix = level === 'error' ? '🔴 [ERROR]' : '🔵 [INFO]';
    const logItem = document.createElement('div');
    logItem.className = 'audit-log-content';
    logItem.style.marginBottom = '8px';
    logItem.innerHTML = `<span style="color:var(--text-secondary); font-size:10px;">${time}</span> <span style="font-weight:600; color:${level === 'error' ? 'var(--semantic-error)' : 'var(--accent-cyan)'};">${prefix}</span> ${msg}`;
    
    // Prepend to display latest logs on top
    orchestratorConsoleLogs.insertBefore(logItem, orchestratorConsoleLogs.firstChild);
    
    // Crop logs to avoid bloat
    if (orchestratorConsoleLogs.children.length > 8) {
      orchestratorConsoleLogs.removeChild(orchestratorConsoleLogs.lastChild);
    }
  }

  // Sync Loop Coordinator
  async function syncSubagentMesh() {
    try {
      const res = await fetch('/api/agents/tasks');
      const tasks = await res.json();
      
      // Update Task Queue
      renderTasksQueue(tasks);
      
      // Update mesh nodes & connections
      updateVisualMeshState(tasks);

      // Auto update streaming panel if a specific handoff is active
      if (activeHandoffRole) {
        await streamHandoffMarkdown(activeHandoffRole);
      }
    } catch (e) {
      console.error('Sync subagents mesh queue error:', e);
    }
  }

  // Boot UI integrations
  fetchPersonas();
  syncSubagentMesh();
  
  // Poll tasks every 3 seconds for instant updates
  setInterval(syncSubagentMesh, 3000);
});
