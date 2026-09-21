'use strict';

function renderControlPaneHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NEXUS-OS Control Pane</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: dark;
      --bg: #06080d;
      --bg-gradient: radial-gradient(circle at 50% 0%, #0d1527 0%, #06080d 75%);
      --panel: rgba(13, 18, 28, 0.75);
      --panel-hover: rgba(18, 26, 40, 0.85);
      --panel-2: #141b27;
      --ink: #E6EDF3;
      --muted: #7E8B9B;
      --line: #1b2438;
      --accent: #00F0FF;
      --accent-gradient: linear-gradient(135deg, #00F0FF, #8A2BE2);
      --accent-2: #8A2BE2;
      --danger: #FF3366;
      --blue: #38BDF8;
      --shadow: rgba(0, 0, 0, 0.45);
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      background-image: var(--bg-gradient);
      background-attachment: fixed;
      color: var(--ink);
      min-width: 320px;
      -webkit-font-smoothing: antialiased;
    }

    button, input {
      font: inherit;
    }

    .shell {
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 14px 22px;
      border-bottom: 1px solid var(--line);
      background: rgba(8, 11, 18, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 220px;
    }

    .brand-badge {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(138,43,226,0.2));
      border: 1px solid rgba(0,240,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 16px;
      color: #00F0FF;
      box-shadow: 0 0 15px rgba(0,240,255,0.2);
    }

    .brand-title-wrap {
      display: flex;
      flex-direction: column;
    }

    h1 {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
      margin: 0;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .live-badge {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #00F0FF;
      background: rgba(0,240,255,0.1);
      border: 1px solid rgba(0,240,255,0.3);
      border-radius: 999px;
      padding: 2px 7px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    .brand-sub {
      font-size: 11px;
      color: var(--muted);
      letter-spacing: 0.02em;
    }

    .query {
      flex: 1;
      display: flex;
      gap: 8px;
      min-width: 220px;
      max-width: 680px;
    }

    input[type="search"] {
      width: 100%;
      color: var(--ink);
      background: rgba(10, 14, 22, 0.9);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 9px 14px;
      outline: none;
      font-size: 13px;
      transition: all 0.2s ease;
    }

    input[type="search"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
    }

    button {
      color: var(--ink);
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 9px 14px;
      cursor: pointer;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    button:hover {
      border-color: var(--accent);
      background: rgba(0, 240, 255, 0.08);
      color: #fff;
    }

    button.primary {
      color: #06080d;
      background: var(--accent);
      border-color: var(--accent);
      font-weight: 700;
      box-shadow: 0 2px 10px rgba(0, 240, 255, 0.3);
    }

    button.primary:hover {
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.5);
      transform: translateY(-1px);
    }

    .header-nav {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .nav-btn {
      color: var(--muted);
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      padding: 7px 12px;
      border-radius: 7px;
      border: 1px solid var(--line);
      background: rgba(20, 27, 39, 0.5);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .nav-btn:hover {
      color: var(--ink);
      border-color: var(--accent);
      background: rgba(0, 240, 255, 0.08);
    }

    main {
      padding: 22px;
      display: grid;
      gap: 20px;
      grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
      align-items: start;
    }

    .metrics {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .metric,
    section {
      background: var(--panel);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid var(--line);
      border-radius: 12px;
      box-shadow: 0 12px 30px var(--shadow);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .metric:hover,
    section:hover {
      border-color: rgba(0, 240, 255, 0.25);
    }

    .metric {
      padding: 16px;
      min-height: 88px;
      position: relative;
      overflow: hidden;
    }

    .metric::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: var(--accent-gradient);
    }

    .metric span {
      display: block;
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .metric strong {
      display: block;
      margin-top: 8px;
      font-size: 26px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      line-height: 1;
      color: var(--ink);
    }

    section {
      overflow: hidden;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-bottom: 1px solid var(--line);
      background: rgba(15, 21, 33, 0.6);
    }

    h2 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .subtle {
      color: var(--muted);
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    th, td {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(27, 36, 56, 0.8);
      text-align: left;
      vertical-align: top;
      font-size: 13px;
      overflow-wrap: anywhere;
    }

    th {
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: rgba(10, 14, 22, 0.7);
    }

    tbody tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .stack {
      display: grid;
      gap: 20px;
    }

    .result,
    .connector,
    .work-item,
    .action {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(27, 36, 56, 0.8);
      display: grid;
      gap: 8px;
      transition: background 0.15s ease;
    }

    .result:hover,
    .connector:hover,
    .work-item:hover,
    .action:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .result:last-child,
    .connector:last-child,
    .work-item:last-child,
    .action:last-child {
      border-bottom: 0;
    }

    .kanban {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      padding: 14px 18px;
      border-bottom: 1px solid var(--line);
      background: rgba(8, 12, 19, 0.4);
    }

    .kanban-lane {
      min-width: 0;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(16, 23, 35, 0.6);
      transition: border-color 0.2s ease;
    }

    .kanban-lane:hover {
      border-color: rgba(0, 240, 255, 0.3);
    }

    .kanban-lane span {
      display: block;
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .kanban-lane strong {
      display: block;
      margin-top: 6px;
      font-size: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      line-height: 1;
      color: var(--ink);
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      min-width: 0;
    }

    .row > * {
      min-width: 0;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      letter-spacing: 0.03em;
    }

    .pill.good { color: #00FF9D; background: rgba(0, 255, 157, 0.12); border-color: rgba(0, 255, 157, 0.35); }
    .pill.warn { color: #FFB800; background: rgba(255, 184, 0, 0.12); border-color: rgba(255, 184, 0, 0.35); }
    .pill.bad { color: #FF3366; background: rgba(255, 51, 102, 0.12); border-color: rgba(255, 51, 102, 0.35); }
    .pill.blue { color: #00F0FF; background: rgba(0, 240, 255, 0.12); border-color: rgba(0, 240, 255, 0.35); }

    code {
      display: block;
      width: 100%;
      padding: 10px 12px;
      background: rgba(6, 9, 14, 0.9);
      border: 1px solid var(--line);
      border-radius: 8px;
      color: #A5F3FC;
      overflow-x: auto;
      white-space: pre;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12px;
    }

    #run-output {
      min-height: 48px;
      max-height: 260px;
    }

    #app {
      position: fixed;
      right: 18px;
      bottom: 18px;
      max-width: min(640px, calc(100vw - 36px));
      max-height: 45vh;
      overflow: auto;
      padding: 14px 16px;
      background: rgba(30, 8, 12, 0.95);
      border: 1px solid var(--danger);
      border-radius: 10px;
      color: #ffe5e2;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      white-space: pre-wrap;
      z-index: 20;
    }

    .empty {
      padding: 22px 18px;
      color: var(--muted);
      font-size: 13px;
    }

    @media (max-width: 1040px) {
      main { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      header { align-items: stretch; flex-direction: column; }
      .query { max-width: none; width: 100%; }
    }

    @media (max-width: 560px) {
      main { padding: 14px; }
      .metrics { grid-template-columns: 1fr; }
      .kanban { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .query { flex-direction: column; }
      th:nth-child(4), td:nth-child(4) { display: none; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div class="brand">
        <div class="brand-badge">N</div>
        <div class="brand-title-wrap">
          <h1>NEXUS-OS Control Pane <span class="live-badge">Live</span></h1>
          <span class="brand-sub">Sovereign Swarm Kernel</span>
        </div>
      </div>
      <form class="query" id="query-form">
        <input id="query" type="search" placeholder="Recall operator memory, session context, runbooks...">
        <button class="primary" type="submit">Recall</button>
        <button type="button" id="refresh">Refresh</button>
      </form>
      <nav class="header-nav">
        <a href="/control-plane" class="nav-btn">2D Radar</a>
        <a href="/proximity" class="nav-btn">3D Airspace</a>
      </nav>
    </header>
    <main>
      <div class="stack">
        <div class="metrics" id="metrics"></div>
        <section>
          <div class="section-head">
            <h2>Sessions</h2>
            <span class="subtle" id="db-path"></span>
          </div>
          <div id="sessions"></div>
        </section>
        <section>
          <div class="section-head">
            <h2>Work Items</h2>
            <span class="subtle" id="work-item-count"></span>
          </div>
          <div id="work-items"></div>
        </section>
      </div>
      <div class="stack">
        <section>
          <div class="section-head">
            <h2>Knowledge</h2>
            <span class="subtle" id="knowledge-count"></span>
          </div>
          <div id="knowledge"></div>
        </section>
        <section>
          <div class="section-head">
            <h2>Connectors</h2>
            <span class="subtle" id="connector-count"></span>
          </div>
          <div id="connectors"></div>
        </section>
        <section>
          <div class="section-head">
            <h2>Actions</h2>
            <span class="subtle" id="action-status">local allowlist</span>
          </div>
          <div id="actions"></div>
          <div class="action">
            <code id="run-output">No action output yet.</code>
          </div>
        </section>
      </div>
    </main>
  </div>
  <div id="app" hidden></div>
  <script>
    const state = { query: '' };
    const $ = selector => document.querySelector(selector);
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
    const fmt = new Intl.NumberFormat('en-US');

    function formatError(error) {
      if (!error) return 'Unknown error';
      return error.stack || error.message || String(error);
    }

    function showError(targetSelector, error) {
      const target = $(targetSelector);
      if (!target) return;
      target.hidden = false;
      target.textContent = formatError(error);
    }

    function clearError(targetSelector) {
      const target = $(targetSelector);
      if (!target) return;
      target.hidden = true;
      target.textContent = '';
    }

    async function readJsonResponse(response) {
      let payload;
      try {
        payload = await response.json();
      } catch (error) {
        throw new Error('Expected JSON response from control pane: ' + error.message);
      }

      if (!response.ok) {
        const detail = payload && payload.error ? payload.error : response.status + ' ' + response.statusText;
        throw new Error(detail);
      }

      return payload;
    }

    function statePill(stateName) {
      const state = String(stateName || 'unknown');
      const klass = ['running', 'done'].includes(state)
        ? 'good'
        : ['failed', 'blocked'].includes(state)
          ? 'bad'
          : ['pending', 'ready'].includes(state)
            ? 'warn'
            : 'blue';
      return '<span class="pill ' + klass + '">' + escapeHtml(state) + '</span>';
    }

    function renderMetrics(summary) {
      const items = [
        ['Sessions', summary.totalSessions],
        ['Running', summary.runningSessions],
        ['Unread', summary.unreadMessages],
        ['Tokens', fmt.format(summary.totalTokens || 0)],
      ];
      $('#metrics').innerHTML = items.map(([label, value]) =>
        '<div class="metric"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>'
      ).join('');
    }

    function renderSessions(sessions) {
      if (!sessions.length) {
        $('#sessions').innerHTML = '<div class="empty">No NEXUS sessions found.</div>';
        return;
      }

      $('#sessions').innerHTML = '<table><thead><tr><th>State</th><th>Session</th><th>Harness</th><th>Worktree</th><th>Updated</th></tr></thead><tbody>' +
        sessions.map(session => '<tr>' +
          '<td>' + statePill(session.state) + '</td>' +
          '<td><strong>' + escapeHtml(session.id) + '</strong><br><span class="subtle">' + escapeHtml(session.task) + '</span></td>' +
          '<td>' + escapeHtml(session.agentType || session.harness) + '<br><span class="subtle">' + escapeHtml((session.detectedHarnesses || []).join(', ')) + '</span></td>' +
          '<td>' + escapeHtml(session.worktree ? session.worktree.branch || session.worktree.path : '-') + '</td>' +
          '<td>' + escapeHtml(session.updatedAt || '-') + '</td>' +
        '</tr>').join('') +
      '</tbody></table>';
    }

    function renderWorkItems(workItems) {
      const summary = workItems || { totalCount: 0, openCount: 0, blockedCount: 0, doneCount: 0, kanban: {}, items: [] };
      const items = Array.isArray(summary.items) ? summary.items : [];
      const kanban = summary.kanban || {};
      const needsAssignment = Array.isArray(summary.needsAssignment) ? summary.needsAssignment : [];
      const assignment = summary.assignment || { agent: 0, human: 0, unassigned: 0 };
      $('#work-item-count').textContent = summary.openCount + ' open / ' + summary.blockedCount + ' blocked'
        + ' / ' + (assignment.agent || 0) + ' agent / ' + (assignment.human || 0) + ' human'
        + (needsAssignment.length ? ' / ' + needsAssignment.length + ' need owner' : '');

      const lanes = ['ready', 'running', 'blocked', 'done'];
      const laneHtml = '<div class="kanban">' + lanes.map(lane =>
        '<div class="kanban-lane"><span>' + escapeHtml(lane) + '</span><strong>' + escapeHtml(kanban[lane] || 0) + '</strong></div>'
      ).join('') + '</div>';

      if (!items.length) {
        $('#work-items').innerHTML = laneHtml + '<div class="empty">No agent work items found.</div>';
        return;
      }

      $('#work-items').innerHTML = laneHtml + items.slice(0, 8).map(item => {
        const branch = item.branch || (item.metadata && item.metadata.branch) || '';
        const mergeGate = item.mergeGate || (item.metadata && item.metadata.mergeGate) || '';
        const blocker = item.blocker || (item.metadata && item.metadata.blocker) || '';
        const assigneeKind = item.assigneeKind || 'unassigned';
        const owner = item.assignee || item.owner || (assigneeKind === 'unassigned' ? 'unassigned (JIT)' : item.source) || 'unassigned';
        // Ids/lanes go into HTML-escaped data-* attributes and are read back via
        // dataset in delegated listeners below — never concatenated into inline
        // JS handlers — so a crafted work-item id cannot inject script (XSS).
        const idAttr = escapeHtml(item.id);
        const moveButtons = ['ready', 'running', 'blocked', 'done'].map(lane =>
          '<button type="button" data-wi-action="move" data-wi-id="' + idAttr + '" data-wi-lane="' + lane + '">' + escapeHtml(lane) + '</button>'
        ).join('');
        const controls = state.allowActions
          ? '<div class="row">'
            + (assigneeKind === 'unassigned' ? '<button type="button" data-wi-action="claim" data-wi-id="' + idAttr + '">Claim</button>' : '')
            + moveButtons
            + '</div>'
          : '';
        return '<div class="work-item">' +
          '<div class="row"><strong>' + escapeHtml(item.title || item.id) + '</strong>' + statePill(item.kanbanState || item.status) + '</div>' +
          '<div class="subtle">[' + escapeHtml(assigneeKind) + '] ' + escapeHtml(owner) + ' - ' + escapeHtml(item.source || 'manual') + (item.priority ? ' - ' + escapeHtml(item.priority) : '') + '</div>' +
          (branch ? '<div class="subtle">branch: ' + escapeHtml(branch) + '</div>' : '') +
          (mergeGate ? '<div class="subtle">merge gate: ' + escapeHtml(mergeGate) + '</div>' : '') +
          (blocker ? '<div class="subtle">blocker: ' + escapeHtml(blocker) + '</div>' : '') +
          controls +
        '</div>';
      }).join('');

      document.querySelectorAll('#work-items [data-wi-action]').forEach(button => {
        button.addEventListener('click', () => {
          const id = button.getAttribute('data-wi-id');
          if (button.getAttribute('data-wi-action') === 'claim') {
            nexusClaimItem(id);
          } else {
            nexusMoveItem(id, button.getAttribute('data-wi-lane'));
          }
        });
      });
    }

    function renderKnowledge(knowledge) {
      $('#knowledge-count').textContent = knowledge.entityCount + ' entities';
      if (!knowledge.results.length) {
        $('#knowledge').innerHTML = '<div class="empty">No recall results for this query.</div>';
        return;
      }

      $('#knowledge').innerHTML = knowledge.results.map(result => {
        const entity = result.entity;
        const obs = result.latestObservation;
        return '<div class="result">' +
          '<div class="row"><strong>' + escapeHtml(entity.name) + '</strong><span class="pill good">score ' + escapeHtml(result.score) + '</span></div>' +
          '<div class="subtle">' + escapeHtml(entity.entityType) + (entity.path ? ' - ' + escapeHtml(entity.path) : '') + '</div>' +
          '<div>' + escapeHtml(entity.summary || '') + '</div>' +
          (obs ? '<div class="subtle">' + (result.hasPinnedObservation ? 'Pinned - ' : '') + escapeHtml(obs.summary) + '</div>' : '') +
          '<div class="subtle">terms: ' + escapeHtml((result.matchedTerms || []).join(', ') || '-') + '</div>' +
        '</div>';
      }).join('');
    }

    function renderConnectors(connectors) {
      $('#connector-count').textContent = connectors.length + ' configured';
      if (!connectors.length) {
        $('#connectors').innerHTML = '<div class="empty">No memory connectors configured.</div>';
        return;
      }

      $('#connectors').innerHTML = connectors.map(connector => {
        const status = connector.syncedSources > 0 ? '<span class="pill good">synced</span>' : '<span class="pill warn">not synced</span>';
        return '<div class="connector">' +
          '<div class="row"><strong>' + escapeHtml(connector.name) + '</strong>' + status + '</div>' +
          '<div class="subtle">' + escapeHtml(connector.kind) + ' - ' + escapeHtml(connector.path || '-') + '</div>' +
          '<div class="subtle">sources ' + escapeHtml(connector.syncedSources) + ' - last ' + escapeHtml(connector.lastSyncedAt || '-') + '</div>' +
        '</div>';
      }).join('');
    }

    function renderActions(actions) {
      $('#actions').innerHTML = actions.map(action => '<div class="action">' +
        '<div class="row"><strong>' + escapeHtml(action.label) + '</strong>' +
        (action.executable ? '<button data-action="' + escapeHtml(action.id) + '">Run</button>' : '<span class="pill">copy</span>') + '</div>' +
        '<div class="subtle">' + escapeHtml(action.description) + '</div>' +
        '<code>' + escapeHtml(action.commandLine) + '</code>' +
      '</div>').join('');

      document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', () => {
          runAction(button.dataset.action);
        });
      });
    }

    async function runAction(actionId) {
      const output = $('#run-output');
      output.textContent = 'Running ' + actionId + '...';

      try {
        const response = await fetch('/api/actions/' + encodeURIComponent(actionId), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ query: state.query })
        });
        const payload = await readJsonResponse(response);
        output.textContent = JSON.stringify(payload, null, 2);
        await load();
      } catch (error) {
        output.textContent = formatError(error);
      }
    }

    async function load() {
      const url = new URL('/api/snapshot', window.location.href);
      if (state.query) url.searchParams.set('query', state.query);
      const response = await fetch(url);
      const snapshot = await readJsonResponse(response);
      $('#query').value = snapshot.knowledge.query || state.query;
      $('#db-path').textContent = snapshot.database.exists ? snapshot.dbPath : 'database missing';
      state.allowActions = Boolean(snapshot.execution.allowActions);
      $('#action-status').textContent = state.allowActions ? 'local allowlist' : 'read-only';
      renderMetrics(snapshot.summary);
      renderSessions(snapshot.sessions);
      renderWorkItems(snapshot.workItems);
      renderKnowledge(snapshot.knowledge);
      renderConnectors(snapshot.connectors);
      renderActions(snapshot.actions.map(action => ({
        ...action,
        executable: snapshot.execution.allowActions && action.executable
      })));
      clearError('#app');
    }

    $('#query-form').addEventListener('submit', event => {
      event.preventDefault();
      state.query = $('#query').value.trim();
      load().catch(error => showError('#app', error));
    });
    $('#refresh').addEventListener('click', () => {
      load().catch(error => showError('#app', error));
    });

    async function postWorkItem(pathSuffix, payload) {
      const response = await fetch('/api/work-items/' + pathSuffix, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload || {})
      });
      const result = await readJsonResponse(response);
      if (!result.ok) throw new Error(result.error || 'request failed');
      await load();
    }

    window.nexusClaimItem = function (id) {
      if (!state.allowActions) return;
      const owner = window.prompt('Claim "' + id + '" as (owner name):');
      if (!owner) return;
      const as = (window.prompt("Owner kind: 'agent' or 'human'", 'human') || '').trim().toLowerCase();
      postWorkItem(encodeURIComponent(id) + '/claim', { owner: owner.trim(), as: as === 'agent' ? 'agent' : 'human' })
        .catch(error => showError('#app', error));
    };
    window.nexusMoveItem = function (id, lane) {
      if (!state.allowActions) return;
      postWorkItem(encodeURIComponent(id) + '/move', { lane })
        .catch(error => showError('#app', error));
    };

    // Live board: refresh on a gentle interval; pause while a prompt/tab is hidden.
    setInterval(() => {
      if (document.hidden) return;
      load().catch(() => {});
    }, 15000);

    load().catch(error => showError('#app', error));
  </script>
</body>
</html>`;
}

module.exports = {
  renderControlPaneHtml
};
