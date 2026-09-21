'use strict';

/**
 * Self-contained 3D "agent airspace" visualization, served by the control pane.
 *
 * Renders each agent as a point in code-space (positions from the proximity
 * embedding), sized by working-set size and colored by collision risk, with
 * links between converging pairs (amber = transmit advisory, red = steer). The
 * scene auto-rotates so you can read the cloud. Dependency-free: a hand-rolled
 * 3D2D projection on a <canvas>, no external scripts (CSP/offline friendly).
 *
 * This is the operator/Enterprise view of Layer 4: multi-agent observability:
 * literally watch the swarm and watch one agent steer away from a collision.
 */

function renderProximityVizHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>NEXUS Agent Airspace</title>
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
  .badge-3d {
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
    grid-template-columns: 1fr 340px;
    height: calc(100vh - 53px);
  }
  #stage {
    position: relative;
    background: radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.04) 0%, transparent 65%);
  }
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  #side {
    border-left: 1px solid var(--panel-border);
    padding: 16px;
    overflow-y: auto;
    background: rgba(13, 18, 28, 0.5);
  }
  #side h2 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 0 0 12px;
    font-weight: 700;
  }
  .adv {
    border: 1px solid var(--panel-border);
    border-left: 3px solid var(--panel-border);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 10px;
    background: rgba(16, 23, 35, 0.6);
    transition: border-color 0.2s ease;
  }
  .adv.resolution {
    border-color: rgba(255, 51, 102, 0.4);
    border-left-color: var(--danger);
    background: rgba(255, 51, 102, 0.05);
  }
  .adv.advisory {
    border-color: rgba(255, 184, 0, 0.4);
    border-left-color: var(--warn);
    background: rgba(255, 184, 0, 0.05);
  }
  .adv .lv {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: 'JetBrains Mono', monospace;
  }
  .adv.resolution .lv { color: var(--danger); }
  .adv.advisory .lv { color: var(--warn); }
  .adv .who {
    color: #A5F3FC;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    margin-top: 3px;
  }
  .adv .act {
    color: var(--ink);
    font-size: 12px;
    margin-top: 4px;
  }
  .empty {
    color: var(--muted);
    font-size: 12px;
    padding: 14px;
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
      <h1>NEXUS - Agent Airspace <span class="badge-3d">3D CLOUD</span></h1>
    </div>
    <span class="sub" id="status">connecting...</span>
    <nav>
      <a href="/">Board</a>
      <a href="/control-plane">2D Control Plane</a>
    </nav>
  </header>
  <div id="wrap">
    <div id="stage">
      <canvas id="c"></canvas>
      <div id="legend">
        <div><span class="dot" style="background:#00FF9D"></span>clear</div>
        <div><span class="dot" style="background:#FFB800"></span>traffic advisory (transmit)</div>
        <div><span class="dot" style="background:#FF3366"></span>resolution (steer)</div>
      </div>
    </div>
    <div id="side">
      <h2>Airspace Advisories</h2>
      <div id="advisories"><div class="empty">No advisories - airspace clear.</div></div>
    </div>
  </div>
<script>
(function () {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var state = { positions: [], links: [], advisories: [], riskByAgent: {} };
  var angle = 0;

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);

  function riskColor(risk) {
    if (risk >= 0.7) return '#FF3366';
    if (risk >= 0.35) return '#FFB800';
    return '#00FF9D';
  }

  // 3D to 2D: rotate around Y, simple perspective.
  function project(p, w, h) {
    var x = p[0], y = p[1] || 0, z = p[2] || 0;
    var ca = Math.cos(angle), sa = Math.sin(angle);
    var rx = x * ca - z * sa;
    var rz = x * sa + z * ca;
    var scale = 2.4 / (3.2 + rz); // perspective
    return [w / 2 + rx * scale * (Math.min(w, h) * 0.32), h / 2 + y * scale * (Math.min(w, h) * 0.32), scale];
  }

  function draw() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Subtle 3D plane orbital grid ring
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 60, Math.min(w, h) * 0.38, Math.min(w, h) * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();

    var pos = {};
    for (var i = 0; i < state.positions.length; i++) {
      var a = state.positions[i];
      pos[a.agentId] = project(a.position || [0, 0, 0], w, h);
    }
    // links first (under the points)
    for (var l = 0; l < state.links.length; l++) {
      var link = state.links[l];
      if (link.risk < 0.2) continue;
      var pa = pos[link.a], pb = pos[link.b];
      if (!pa || !pb) continue;
      ctx.strokeStyle = riskColor(link.risk);
      ctx.globalAlpha = Math.min(1, 0.3 + link.risk * 0.7);
      ctx.lineWidth = 1.5 + link.risk * 3;
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // points
    for (var k = 0; k < state.positions.length; k++) {
      var ag = state.positions[k];
      var p = pos[ag.agentId];
      var radius = (6 + Math.sqrt(ag.fileCount || 1) * 3) * p[2];
      var color = riskColor(state.riskByAgent[ag.agentId] || 0);

      // outer glow halo
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.beginPath(); ctx.arc(p[0], p[1], radius + 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // inner node
      ctx.beginPath(); ctx.arc(p[0], p[1], radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#E6EDF3';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(String(ag.agentId).slice(0, 18), p[0] + radius + 5, p[1] + 4);
    }
    angle += 0.0035;
    requestAnimationFrame(draw);
  }

  function renderAdvisories() {
    var box = document.getElementById('advisories');
    box.textContent = '';
    if (!state.advisories.length) {
      var e = document.createElement('div'); e.className = 'empty';
      e.textContent = 'No advisories - airspace clear.'; box.appendChild(e); return;
    }
    state.advisories.forEach(function (adv) {
      var el = document.createElement('div');
      el.className = 'adv ' + (adv.level === 'resolution' ? 'resolution' : 'advisory');
      var lv = document.createElement('div'); lv.className = 'lv';
      lv.textContent = Math.round(adv.risk * 100) + '% - ' + adv.level; el.appendChild(lv);
      var who = document.createElement('div'); who.className = 'who';
      who.textContent = (adv.aLabel || adv.a) + '  <->  ' + (adv.bLabel || adv.b); el.appendChild(who);
      var act = document.createElement('div'); act.className = 'act';
      act.textContent = adv.level === 'resolution'
        ? (adv.steer + ' steers - ' + adv.hold + ' holds')
        : 'both transmit intent';
      el.appendChild(act);
      box.appendChild(el);
    });
  }

  function applySnapshot(prox) {
    state.positions = prox.positions || [];
    state.links = prox.links || [];
    state.advisories = prox.advisories || [];
    var risk = {};
    state.links.forEach(function (l) {
      risk[l.a] = Math.max(risk[l.a] || 0, l.risk);
      risk[l.b] = Math.max(risk[l.b] || 0, l.risk);
    });
    state.riskByAgent = risk;
    renderAdvisories();
    var c = prox.counts || {};
    document.getElementById('status').textContent =
      (c.agents || 0) + ' agents - ' + (c.advisories || 0) + ' advisories - ' + (c.resolutions || 0) + ' steering';
  }

  function poll() {
    fetch('/api/proximity').then(function (r) { return r.json(); }).then(function (data) {
      applySnapshot(data && data.enabled ? data : (data || {}));
    }).catch(function () {
      document.getElementById('status').textContent = 'offline';
    });
  }

  resize();
  poll();
  setInterval(poll, 5000);
  requestAnimationFrame(draw);
})();
</script>
</body>
</html>`;
}

module.exports = { renderProximityVizHtml };
