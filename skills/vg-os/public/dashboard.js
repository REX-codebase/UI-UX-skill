/**
 * Avant-Garde Design OS Dashboard - Event Controller & Client Diagnostics
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const previewFrame = document.getElementById('previewFrame');
  const iframeWrapper = document.getElementById('iframeWrapper');
  const recompileBtn = document.getElementById('recompileBtn');
  const gridToggle = document.getElementById('gridToggle');
  const layersList = document.getElementById('layersList');
  const connectionStatus = document.getElementById('connectionStatus');
  
  // Settings values
  const canvasWidthVal = document.getElementById('canvasWidthVal');
  const canvasHeightVal = document.getElementById('canvasHeightVal');
  const canvasBgVal = document.getElementById('canvasBgVal');
  const canvasBgIndicator = document.getElementById('canvasBgIndicator');
  
  // Audits values
  const scoreRing = document.getElementById('scoreRing');
  const auditScoreVal = document.getElementById('auditScoreVal');
  const auditStatusVal = document.getElementById('auditStatusVal');
  const auditTimeVal = document.getElementById('auditTimeVal');
  const auditLogsList = document.getElementById('auditLogsList');
  
  // Viewport size controllers
  const viewBtns = document.querySelectorAll('.view-btn');
  
  // Dynamic settings
  let activeCanvasState = null;
  let globalCssCM = null;
  let htmlLayerCM = null;
  let selectedHtmlLayerIndex = -1;

  // Initialize CodeMirrors if not yet
  function initEditors() {
    if (!globalCssCM && document.getElementById('globalCssEditor')) {
      globalCssCM = CodeMirror.fromTextArea(document.getElementById('globalCssEditor'), {
        mode: 'css',
        theme: 'dracula',
        lineNumbers: true,
        viewportMargin: Infinity
      });
      globalCssCM.setSize(null, 150);
    }
    if (!htmlLayerCM && document.getElementById('htmlLayerEditor')) {
      htmlLayerCM = CodeMirror.fromTextArea(document.getElementById('htmlLayerEditor'), {
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        viewportMargin: Infinity
      });
      htmlLayerCM.setSize(null, 150);
    }
  }

  // 1. Viewport size switcher
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const size = btn.getAttribute('data-size');
      
      // Clean up previous classes
      iframeWrapper.classList.remove('view-desktop', 'view-tablet', 'view-mobile');
      
      // Set new device simulated view class
      if (size === 'desktop') {
        iframeWrapper.classList.add('view-desktop');
      } else if (size === 'tablet') {
        iframeWrapper.classList.add('view-tablet');
      } else if (size === 'mobile') {
        iframeWrapper.classList.add('view-mobile');
      }
      
      // Keep alignment
      setTimeout(syncIframeGrid, 100);
    });
  });

  // 2. Compile handler
  recompileBtn.addEventListener('click', async () => {
    recompileBtn.innerText = 'Compiling...';
    recompileBtn.disabled = true;
    try {
      const res = await fetch('/api/compile', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        // Reload frame
        previewFrame.src = '/compiled/index.html?t=' + Date.now();
        // Update audits
        await fetchDiagnostics();
      }
    } catch (e) {
      console.error('Recompile request failed:', e);
    } finally {
      recompileBtn.innerText = 'Recompile Layout';
      recompileBtn.disabled = false;
    }
  });

  // 3. Grid overlay syncing helper
  function syncIframeGrid() {
    try {
      if (previewFrame.contentWindow) {
        previewFrame.contentWindow.postMessage({
          type: 'TOGGLE_GRID',
          show: gridToggle.checked
        }, '*');
      }
    } catch (e) {
      // safe fallback
    }
  }

  gridToggle.addEventListener('change', syncIframeGrid);
  previewFrame.addEventListener('load', syncIframeGrid);

  // 4. Fetch active state settings
  async function fetchState() {
    try {
      const res = await fetch('/api/state');
      if (res.status === 404) {
        connectionStatus.innerText = 'Initializing State...';
        return;
      }
      const data = await res.json();
      activeCanvasState = data;
      
      // Populate sidebar settings
      canvasWidthVal.innerText = data.canvas.width;
      canvasHeightVal.innerText = data.canvas.height;
      canvasBgVal.innerText = data.canvas.bg;
      canvasBgIndicator.style.backgroundColor = data.canvas.bg;
      
      initEditors();

      // Only update editors if they don't have focus to avoid interrupting typing
      if (globalCssCM && !globalCssCM.hasFocus()) {
        globalCssCM.setValue(data.globalCss || '');
      }

      // Update HTML Layers dropdown
      updateHtmlLayersDropdown(data.layers);

      // Populate layers list
      renderLayersList(data.layers);
      connectionStatus.innerText = 'CLI Node Connection Synced';
    } catch (e) {
      console.error('Fetch canvas state error:', e);
      connectionStatus.innerText = 'Connection Interrupted';
    }
  }

  function updateHtmlLayersDropdown(layers) {
    const select = document.getElementById('htmlLayerSelect');
    if (!select) return;
    
    // Remember currently selected
    const currentVal = select.value;
    
    // Clear old layer options (keep first 2: default and new)
    while (select.options.length > 2) {
      select.remove(2);
    }
    
    let foundCurrent = false;
    layers.forEach((layer, idx) => {
      if (layer.type === 'html') {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.text = layer.name || `html-${idx}`;
        select.add(opt);
        if (String(idx) === currentVal) foundCurrent = true;
      }
    });

    if (foundCurrent) {
      select.value = currentVal;
    } else if (currentVal !== 'new') {
      select.value = "";
      document.getElementById('htmlLayerEditorGroup').style.display = 'none';
    }
  }

  // Handle HTML dropdown change
  document.getElementById('htmlLayerSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const group = document.getElementById('htmlLayerEditorGroup');
    if (!val) {
      group.style.display = 'none';
      selectedHtmlLayerIndex = -1;
    } else {
      group.style.display = 'block';
      initEditors();
      if (val === 'new') {
        selectedHtmlLayerIndex = -1;
        htmlLayerCM.setValue('<div>New HTML Layer</div>');
      } else {
        selectedHtmlLayerIndex = parseInt(val, 10);
        const layer = activeCanvasState.layers[selectedHtmlLayerIndex];
        htmlLayerCM.setValue(layer.content || '');
      }
    }
  });

  // Save Global CSS
  document.getElementById('saveGlobalCssBtn')?.addEventListener('click', async () => {
    if (!activeCanvasState) return;
    const newCss = globalCssCM.getValue();
    activeCanvasState.globalCss = newCss;
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeCanvasState)
      });
      // Optionally trigger reload frame (server auto compiles)
      previewFrame.src = '/compiled/index.html?t=' + Date.now();
    } catch(e) { console.error('Save Global CSS error', e); }
  });

  // Save HTML Layer
  document.getElementById('saveHtmlLayerBtn')?.addEventListener('click', async () => {
    if (!activeCanvasState) return;
    const newHtml = htmlLayerCM.getValue();
    
    if (selectedHtmlLayerIndex >= 0) {
      // Update existing
      activeCanvasState.layers[selectedHtmlLayerIndex].content = newHtml;
    } else {
      // Create new
      activeCanvasState.layers.push({
        type: 'html',
        name: `html-${activeCanvasState.layers.length}`,
        x: 0, y: 0, w: 200, h: 200,
        zIndex: (activeCanvasState.layers.length + 1) * 10,
        content: newHtml
      });
      // Immediately reset so next save updates this new one? No, we just rely on fetchState loop
    }
    
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeCanvasState)
      });
      previewFrame.src = '/compiled/index.html?t=' + Date.now();
      // fetchState will pull the new state down shortly
    } catch(e) { console.error('Save HTML Layer error', e); }
  });

  // 5. Render list of layers
  function renderLayersList(layers) {
    if (!layers || layers.length === 0) {
      layersList.innerHTML = '<div class="empty-layers">No active visual layers found. Draw elements via CLI.</div>';
      return;
    }

    layersList.innerHTML = '';
    layers.forEach((layer, idx) => {
      const item = document.createElement('div');
      item.className = 'layer-item';
      item.setAttribute('data-layer-id', layer.name || `layer-${idx}`);
      
      let fillVal = layer.fill || layer.color || '#fff';
      if (fillVal.length > 25) fillVal = fillVal.substring(0, 22) + '...';

      const safeName = (layer.name || 'layer-' + idx).toString().replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
      const safeType = (layer.type || '').toString().replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
      const safeFill = fillVal.toString().replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

      item.innerHTML = `
        <div class="layer-meta-top">
          <span class="layer-name">${safeName}</span>
          <span class="layer-badge">${safeType}</span>
        </div>
        <div class="layer-coords">
          X: ${layer.x} Y: ${layer.y} | W: ${layer.w} H: ${layer.h}
        </div>
        <div class="layer-coords" style="color: var(--accent-cyan); font-size:10px; margin-top: 2px;">
          Fill: ${safeFill}
        </div>
      `;

      // 6. Interactive Visual Inspector outline triggers
      item.addEventListener('mouseenter', () => {
        highlightIframeElement(layer.name || `rect-${idx}`, true);
      });
      item.addEventListener('mouseleave', () => {
        highlightIframeElement(layer.name || `rect-${idx}`, false);
      });

      layersList.appendChild(item);
    });
  }

  // Injects neon inspection frames into the compiled webpage iframe
  function highlightIframeElement(elemId, activate) {
    try {
      if (previewFrame.contentWindow) {
        previewFrame.contentWindow.postMessage({
          type: 'HIGHLIGHT',
          id: elemId,
          activate: activate
        }, '*');
      }
    } catch (e) {
      // safe fallback
    }
  }

  // 7. Diagnostics Visual Audit loader
  async function fetchDiagnostics() {
    try {
      const res = await fetch('/api/test');
      const report = await res.json();
      
      // Update gauges
      animateScoreRing(report.score);
      auditScoreVal.innerText = report.score;
      auditStatusVal.innerText = report.status;
      
      // Sync semantic text color classes
      auditStatusVal.className = '';
      if (report.status === 'PASS') {
        auditStatusVal.classList.add('status-pass');
      } else if (report.status === 'WARNING') {
        auditStatusVal.classList.add('status-warning');
      } else {
        auditStatusVal.classList.add('status-fail');
      }
      
      // Checked time
      const date = new Date(report.timestamp);
      auditTimeVal.innerText = `Checked at ${date.toLocaleTimeString()}`;
      
      // Update audits logs
      renderAuditLogs(report.logs);
    } catch (e) {
      console.error('Fetch diagnostics report failed:', e);
    }
  }

  // SVG Radial score meter dynamics
  function animateScoreRing(score) {
    const circumference = 251.2; // 2 * pi * r (r=40)
    const offset = circumference - (circumference * score / 100);
    scoreRing.style.strokeDashoffset = offset;
    
    // Change score colors based on status levels
    if (score >= 90) {
      scoreRing.style.stroke = 'var(--semantic-success)';
    } else if (score >= 75) {
      scoreRing.style.stroke = 'var(--semantic-warning)';
    } else {
      scoreRing.style.stroke = 'var(--semantic-error)';
    }
  }

  function renderAuditLogs(logs) {
    if (!logs || logs.length === 0) {
      auditLogsList.innerHTML = `
        <div class="audit-success-banner">
          <span class="check-icon">✓</span> Perfect spatial standards. 0 warnings detected.
        </div>
      `;
      return;
    }

    auditLogsList.innerHTML = '';
    logs.forEach(log => {
      const logItem = document.createElement('div');
      logItem.className = `audit-log-item severity-${log.severity}`;
      
      const icon = log.severity === 'high' ? '❌' : '⚠️';
      
      logItem.innerHTML = `
        <div class="audit-log-icon">${icon}</div>
        <div class="audit-log-content">
          <h4>${log.type}</h4>
          <p>${log.message}</p>
        </div>
      `;
      
      auditLogsList.appendChild(logItem);
    });
  }

  // Orchestrate Polling Loop loops
  async function loop() {
    await fetchState();
    await fetchDiagnostics();
  }

  // Boot OS feeds
  loop();
  // Poll state every 4 seconds to reflect terminal CLI draws instantly
  setInterval(loop, 4000);
});
