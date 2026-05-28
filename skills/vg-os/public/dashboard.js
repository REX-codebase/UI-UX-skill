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
      const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
      const viewport = iframeDoc.getElementById('viewport');
      if (viewport) {
        viewport.classList.toggle('show-grid', gridToggle.checked);
      }
    } catch (e) {
      // Cross-origin checks could block if port/host is distinct, 
      // but locally they share same root server so this is safe.
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
      
      // Populate layers list
      renderLayersList(data.layers);
      connectionStatus.innerText = 'CLI Node Connection Synced';
    } catch (e) {
      console.error('Fetch canvas state error:', e);
      connectionStatus.innerText = 'Connection Interrupted';
    }
  }

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

      item.innerHTML = `
        <div class="layer-meta-top">
          <span class="layer-name">${layer.name || 'layer-' + idx}</span>
          <span class="layer-badge">${layer.type}</span>
        </div>
        <div class="layer-coords">
          X: ${layer.x} Y: ${layer.y} | W: ${layer.w} H: ${layer.h}
        </div>
        <div class="layer-coords" style="color: var(--accent-cyan); font-size:10px; margin-top: 2px;">
          Fill: ${fillVal}
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
      const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
      // We can search elements by layer name (as the compiled output sets id matching layer name)
      const el = iframeDoc.getElementById(elemId);
      if (el) {
        if (activate) {
          el.style.outline = '3px solid var(--accent-cyan, #00f5a0)';
          el.style.boxShadow = '0 0 20px rgba(0, 245, 160, 0.6)';
          el.style.transition = 'all 0.2s ease-out';
          el.style.transform = 'scale(1.02)';
        } else {
          el.style.outline = '';
          el.style.boxShadow = '';
          el.style.transform = '';
        }
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
