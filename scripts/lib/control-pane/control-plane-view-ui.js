'use strict';

/**
 * Self-contained control-plane live view page, served at /control-plane.
 *
 * Draws the 2D PCA projection of the agent pairs (projection.js) on a canvas,
 * the lanes and tasks beside it, and the advisory event feed. Polls
 * /api/control-plane. No external scripts, no framework: it has to work on a
 * loopback server with a strict CSP and offline.
 */

function renderControlPlaneViewHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>NEXUS Control Plane</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: dark;
    --bg: #06080d;
    --panel: #0d121c;
    --panel-border: #1b2438;
    --ink: #e6edf3;
    --muted: #7e8b9b;
    --accent: #00F0FF;
    --accent-violet: #8A2BE2;
    --danger: #FF3366;
    --warn: #FFB800;
    --good: #00FF9D;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 13px/1.5 'Inter', -apple-system, system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }
  header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--panel-border);
    background: rgba(10, 14, 22, 0.9);
    backdrop-filter: blur(16px);
  }
  .brand-badge {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(138,43,226,0.2));
    border: 1px solid rgba(0,240,255,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 14px;
    color: var(--accent);
  }
  header h1 {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .badge-radar {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--accent);
    background: rgba(0,240,255,0.1);
    border: 1px solid rgba(0,240,255,0.3);
    border-radius: 999px;
    padding: 1px 7px;
    font-family: 'JetBrains Mono', monospace;
  }
  header .sub {
    color: var(--muted);
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
  }
  header nav {
    margin-left: auto;
    font-size: 12px;
    display: flex;
    gap: 8px;
  }
  header nav a {
    color: var(--muted);
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid var(--panel-border);
    background: rgba(20, 27, 39, 0.5);
    transition: all 0.2s ease;
  }
  header nav a:hover {
    color: var(--ink);
    border-color: var(--accent);
    background: rgba(0, 240, 255, 0.08);
  }
  #wrap {
    display: grid;
    grid-template-columns: 1fr 380px;
    height: calc(100vh - 53px);
  }
  #stage {
    position: relative;
    border-right: 1px solid var(--panel-border);
    background: radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.03) 0%, transparent 70%);
  }
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  #side {
    padding: 16px;
    overflow-y: auto;
    background: rgba(13, 18, 28, 0.5);
  }
  #side h2 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 16px 0 10px;
    font-weight: 700;
  }
  #side h2:first-child {
    margin-top: 0;
  }
  .ev {
    border: 1px solid var(--panel-border);
    border-left: 3px solid var(--panel-border);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 10px;
    background: rgba(16, 23, 35, 0.6);
    transition: border-color 0.2s ease;
  }
  .ev.resolution {
    border-color: rgba(255, 51, 102, 0.4);
    border-left-color: var(--danger);
    background: rgba(255, 51, 102, 0.05);
  }
  .ev.traffic {
    border-color: rgba(255, 184, 0, 0.4);
    border-left-color: var(--warn);
    background: rgba(255, 184, 0, 0.05);
  }
  .ev.conflict {
    border-color: rgba(0, 240, 255, 0.4);
    border-left-color: var(--accent);
    background: rgba(0, 240, 255, 0.05);
  }
  .ev .lv {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: 'JetBrains Mono', monospace;
  }
  .ev.resolution .lv { color: var(--danger); }
  .ev.traffic .lv { color: var(--warn); }
  .ev.conflict .lv { color: var(--accent); }
  .ev .msg {
    color: var(--ink);
    font-size: 12px;
    margin-top: 4px;
  }
  .lane {
    margin-bottom: 12px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 10px;
    background: rgba(16, 23, 35, 0.4);
  }
  .lane .name {
    color: var(--ink);
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 6px;
  }
  .task {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: 12px;
    padding: 4px 6px;
    border-radius: 4px;
    color: var(--muted);
  }
  .task:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  .task .id {
    color: #A5F3FC;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }
  .task .risk {
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }
  .empty {
    color: var(--muted);
    font-size: 12px;
    padding: 12px;
    border: 1px dashed var(--panel-border);
    border-radius: 8px;
    text-align: center;
  }
  #legend {
    position: absolute;
    left: 16px;
    bottom: 16px;
    font-size: 11px;
    color: var(--muted);
    background: rgba(10, 14, 22, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid var(--panel-border);
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  #meta {
    position: absolute;
    right: 16px;
    top: 16px;
    font-size: 11px;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    background: rgba(10, 14, 22, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid var(--panel-border);
    padding: 8px 12px;
    border-radius: 8px;
    text-align: right;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
  }
</style>
</head>
<body>
  <header>
    <div class="brand-badge">N</div>
    <div>
      <h1>NEXUS Control Plane <span class="badge-radar">2D RADAR</span></h1>
    </div>
    <span class="sub" id="status">connecting...</span>
    <nav>
      <a href="/">Board</a>
      <a href="/proximity">3D Airspace</a>
      <a href="/api/control-plane">JSON</a>
    </nav>
  </header>
  <div id="wrap">
    <div id="stage">
      <canvas id="c"></canvas>
      <div id="meta"></div>
      <div id="legend">
        <div><span class="dot" style="background:#00FF9D"></span>clear</div>
        <div><span class="dot" style="background:#FFB800"></span>traffic advisory (transmit)</div>
        <div><span class="dot" style="background:#FF3366"></span>resolution advisory (steer)</div>
      </div>
    </div>
    <div id="side">
      <h2>Active Collision Events</h2>
      <div id="events"><div class="empty">No events. Airspace clear.</div></div>
      <h2>Swarm Lanes</h2>
      <div id="lanes"><div class="empty">No tasks.</div></div>
    </div>
  </div>
<script>
(function () {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var view = { tasks: [], lanes: [], pairs: [], events: [], projection: { agents: [] }, thresholds: { ta: 0.35, ra: 0.7 } };

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  window.addEventListener('resize', resize);

  function riskColor(risk) {
    if (risk >= view.thresholds.ra) return '#FF3366';
    if (risk >= view.thresholds.ta) return '#FFB800';
    return '#00FF9D';
  }

  // Fit the projected points into the canvas with a margin. The PCA scores
  // are centred already, so we only need a scale.
  function fit(points, w, h) {
    var maxAbs = 1e-6;
    points.forEach(function (p) {
      maxAbs = Math.max(maxAbs, Math.abs(p[0] || 0), Math.abs(p[1] || 0));
    });
    var scale = (Math.min(w, h) * 0.4) / maxAbs;
    return function (p) { return [w / 2 + (p[0] || 0) * scale, h / 2 - (p[1] || 0) * scale]; };
  }

  function draw() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var agents = view.projection.agents || [];
    var toScreen = fit(agents.map(function (a) { return a.point; }), w, h);
    var pos = {};
    agents.forEach(function (a) { pos[a.agentId] = toScreen(a.point); });

    // Radar concentric rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.lineWidth = 1;
    var maxR = Math.min(w, h) * 0.42;
    for (var ring = maxR * 0.33; ring <= maxR + 1; ring += maxR * 0.33) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, ring, 0, Math.PI * 2);
      ctx.stroke();
    }

    // axes
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();

    // pair links under the points
    (view.pairs || []).forEach(function (pair) {
      if (pair.risk < 0.2) return;
      var pa = pos[pair.a], pb = pos[pair.b];
      if (!pa || !pb) return;
      ctx.strokeStyle = riskColor(pair.risk);
      ctx.globalAlpha = Math.min(1, 0.25 + pair.risk * 0.7);
      ctx.lineWidth = 1 + pair.risk * 3;
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // agents
    var taskById = {};
    view.tasks.forEach(function (t) { taskById[t.id] = t; });
    agents.forEach(function (a) {
      var p = pos[a.agentId];
      var t = taskById[a.agentId] || {};
      var files = (t.workingSet && t.workingSet.fileCount) || 1;
      var radius = 6 + Math.sqrt(files) * 3;
      ctx.fillStyle = riskColor(a.maxRisk || 0);
      ctx.beginPath(); ctx.arc(p[0], p[1], radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9d1d9';
      ctx.font = '11px -apple-system, system-ui, sans-serif';
      ctx.fillText(String(a.agentId).slice(0, 18), p[0] + radius + 4, p[1] + 3);
    });

    // singleton tasks (no pair yet) sit at the origin, listed in the side panel
    var meta = document.getElementById('meta');
    var pj = view.projection || {};
    var ev = (pj.pca && pj.pca.explainedVariance) || [];
    meta.textContent = 'pca over x_tree, x_overlap, x_dep | ' + (pj.normalization || 'raw') +
      (pj.window && pj.window.samples ? ' | window ' + pj.window.samples : '') +
      (ev.length ? ' | var ' + ev.map(function (x) { return Math.round(x * 100) + '%'; }).join(' / ') : '');
  }

  function renderEvents() {
    var box = document.getElementById('events');
    box.textContent = '';
    if (!view.events.length) {
      var e = document.createElement('div'); e.className = 'empty';
      e.textContent = 'No events. Airspace clear, no declared lease conflicts.'; box.appendChild(e); return;
    }
    view.events.forEach(function (ev) {
      var el = document.createElement('div');
      el.className = 'ev ' + ev.level;
      var lv = document.createElement('div'); lv.className = 'lv';
      lv.textContent = (ev.risk !== undefined ? Math.round(ev.risk * 100) + '% ' : '') + ev.kind + ' / ' + ev.level;
      el.appendChild(lv);
      var msg = document.createElement('div'); msg.className = 'msg';
      msg.textContent = ev.message; el.appendChild(msg);
      box.appendChild(el);
    });
  }

  function renderLanes() {
    var box = document.getElementById('lanes');
    box.textContent = '';
    if (!view.tasks.length) {
      var e = document.createElement('div'); e.className = 'empty';
      e.textContent = 'No tasks.'; box.appendChild(e); return;
    }
    var taskById = {};
    view.tasks.forEach(function (t) { taskById[t.id] = t; });
    view.lanes.forEach(function (lane) {
      var el = document.createElement('div'); el.className = 'lane';
      var name = document.createElement('div'); name.className = 'name';
      name.textContent = lane.label + ' (' + lane.kind + ', ' + lane.taskIds.length + ')';
      el.appendChild(name);
      lane.taskIds.forEach(function (id) {
        var t = taskById[id]; if (!t) return;
        var row = document.createElement('div'); row.className = 'task';
        var idEl = document.createElement('span'); idEl.className = 'id'; idEl.textContent = t.id.slice(0, 20);
        var st = document.createElement('span'); st.textContent = t.harness + ' / ' + t.state + ' / ' + (t.workingSet.fileCount || 0) + ' files';
        var risk = document.createElement('span'); risk.className = 'risk';
        risk.style.color = riskColor(t.projection.maxRisk || 0);
        risk.textContent = t.projection.point ? Math.round((t.projection.maxRisk || 0) * 100) + '%' : 'no pair';
        row.appendChild(idEl); row.appendChild(st); row.appendChild(risk);
        el.appendChild(row);
      });
      box.appendChild(el);
    });
  }

  function apply(data) {
    if (!data || data.schemaVersion !== 'nexus.control-plane.view.v1' ||
        !['tasks', 'lanes', 'pairs', 'events'].every(function (key) { return Array.isArray(data[key]); }) ||
        !data.projection || !Array.isArray(data.projection.agents) || !data.thresholds ||
        !Number.isFinite(data.thresholds.ta) || !Number.isFinite(data.thresholds.ra)) {
      throw new Error('Invalid control-plane view');
    }
    view = Object.assign({}, data);
    renderEvents(); renderLanes(); draw();
    var c = view.counts || {};
    document.getElementById('status').textContent =
      (c.tasks || 0) + ' tasks in ' + (c.lanes || 0) + ' lanes | ' + (c.agents || 0) + ' with edits | ' +
      (c.advisories || 0) + ' advisories (' + (c.resolutions || 0) + ' steering)' +
      (view.inventory && view.inventory.status !== 'ok' ? ' | inventory ' + view.inventory.status : '');
  }

  function poll() {
    fetch('/api/control-plane').then(function (r) {
      if (!r.ok) throw new Error('Control-plane request failed');
      return r.json();
    }).then(apply).catch(function () {
      document.getElementById('status').textContent = 'offline';
    });
  }

  resize();
  poll();
  setInterval(poll, 5000);
})();
</script>
</body>
</html>`;
}

module.exports = { renderControlPlaneViewHtml };
