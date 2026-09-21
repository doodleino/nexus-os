// NEXUS-OS Web App Interactive Controller
import './style.css';

// Catalog dataset representing agents, skills, and commands
const CATALOG_ITEMS = [
  {
    id: 'tdd-driver',
    name: 'tdd-driver',
    type: 'agent',
    category: 'core',
    tags: ['core', 'testing', 'tdd'],
    desc: 'Autonomous Red-Green-Refactor test driver enforcing strict test failure, minimal passing implementation, and 80%+ coverage before merge.',
    command: 'Delegated via /tdd or autonomous loops',
    model: 'claude-3-7-sonnet'
  },
  {
    id: 'db-profile',
    name: '/db-profile',
    type: 'command',
    category: 'database',
    tags: ['database', 'performance', 'sql'],
    desc: 'Deep EXPLAIN (ANALYZE, BUFFERS) query profiling, sequential scan diagnosis, index selectivity analysis, and composite index DDL generation.',
    command: 'nexus /db-profile [query_file.sql]',
    model: 'database-reviewer'
  },
  {
    id: 'perf-audit',
    name: '/perf-audit',
    type: 'command',
    category: 'frontend',
    tags: ['frontend', 'web-vitals', 'performance'],
    desc: 'Core Web Vitals audit (LCP, INP, CLS), JS bundle chunk breakdown, render-blocking asset detection, and budget enforcement.',
    command: 'nexus /perf-audit https://localhost:3000',
    model: 'performance-optimizer'
  },
  {
    id: 'sbom-scan',
    name: '/sbom-scan',
    type: 'command',
    category: 'security',
    tags: ['security', 'supply-chain', 'compliance'],
    desc: 'Generates CycloneDX and SPDX Software Bill of Materials (SBOM), audits all direct and transitive dependencies for CVEs, and verifies license compliance.',
    command: 'nexus /sbom-scan --format cyclonedx',
    model: 'security-reviewer'
  },
  {
    id: 'secret-audit',
    name: '/secret-audit',
    type: 'command',
    category: 'security',
    tags: ['security', 'git', 'hygiene'],
    desc: 'Deep Shannon entropy audit across Git commit history and working tree for leaked API keys, tokens, certificates, and unredacted credentials.',
    command: 'nexus /secret-audit --depth 100',
    model: 'deep-security-auditor'
  },
  {
    id: 'eval-benchmark',
    name: '/eval-benchmark',
    type: 'command',
    category: 'ai',
    tags: ['ai', 'eval', 'benchmarks'],
    desc: 'Agent task evaluation runner: executes benchmark suites with deterministic assertions, task completion rubrics, and LLM-as-a-judge pairwise scoring.',
    command: 'nexus /eval-benchmark --suite swe-bench',
    model: 'agent-evaluator'
  },
  {
    id: 'chaos-test',
    name: '/chaos-test',
    type: 'command',
    category: 'sre',
    tags: ['sre', 'chaos', 'resilience'],
    desc: 'Synthesizes network latency spikes, HTTP 500 fault injection, dropped packets, and process crashes to stress-test circuit breakers and fallbacks.',
    command: 'nexus /chaos-test --target api-gateway',
    model: 'silent-failure-hunter'
  },
  {
    id: 'agent-doctor',
    name: '/agent-doctor',
    type: 'command',
    category: 'core',
    tags: ['core', 'diagnostics', 'mcp'],
    desc: 'Environment diagnostics: verifies Model Context Protocol (MCP) servers, SQLite memory vault tables, token budgets, and adapter bindings.',
    command: 'nexus /agent-doctor',
    model: 'harness-optimizer'
  },
  {
    id: 'vector-embeddings-pgvector',
    name: 'vector-embeddings-pgvector',
    type: 'skill',
    category: 'ai',
    tags: ['ai', 'database', 'embeddings'],
    desc: 'High-dimensional embeddings, chunking strategies, HNSW and IVFFlat indexing, and hybrid dense/sparse keyword search with PostgreSQL pgvector.',
    command: 'Loaded on embedding and semantic retrieval tasks',
    model: 'All models'
  },
  {
    id: 'graph-rag-knowledge-graphs',
    name: 'graph-rag-knowledge-graphs',
    type: 'skill',
    category: 'ai',
    tags: ['ai', 'rag', 'graphs'],
    desc: 'Graph-augmented generation combining dense vector embeddings with Neo4j entity-relationship traversal for complex multi-hop reasoning.',
    command: 'Loaded on knowledge graph queries',
    model: 'All models'
  },
  {
    id: 'semantic-cache-layer',
    name: 'semantic-cache-layer',
    type: 'skill',
    category: 'ai',
    tags: ['ai', 'caching', 'cost'],
    desc: 'Cosine similarity response caching with Redis and Valkey to eliminate redundant LLM inference calls and slash token expenditure by 90%.',
    command: 'Loaded on LLM pipeline optimization',
    model: 'All models'
  },
  {
    id: 'tailwind-v4-architecture',
    name: 'tailwind-v4-architecture',
    type: 'skill',
    category: 'frontend',
    tags: ['frontend', 'css', 'design'],
    desc: 'CSS-first configuration with @theme directives, modern CSS variables engine, dynamic color palettes, and lightningcss build pipeline.',
    command: 'Loaded on frontend styling tasks',
    model: 'All models'
  },
  {
    id: 'drizzle-orm-patterns',
    name: 'drizzle-orm-patterns',
    type: 'skill',
    category: 'database',
    tags: ['database', 'typescript', 'orm'],
    desc: 'Type-safe SQL querying, schema declaration, zero-downtime expand-and-contract migrations, and relational query optimization with Drizzle ORM.',
    command: 'Loaded on TypeScript database tasks',
    model: 'All models'
  },
  {
    id: 'distributed-tracing-jaeger',
    name: 'distributed-tracing-jaeger',
    type: 'skill',
    category: 'sre',
    tags: ['sre', 'tracing', 'opentelemetry'],
    desc: 'End-to-end distributed span instrumentation with OpenTelemetry (OTel), context propagation across microservices, and Jaeger trace analysis.',
    command: 'Loaded on observability tasks',
    model: 'All models'
  },
  {
    id: 'vault-secrets-management',
    name: 'vault-secrets-management',
    type: 'skill',
    category: 'security',
    tags: ['security', 'vault', 'credentials'],
    desc: 'Dynamic database credentials, PKI certificate automation, transit data encryption, and short-lived secret leasing via HashiCorp Vault.',
    command: 'Loaded on credential management',
    model: 'All models'
  },
  {
    id: 'turborepo-monorepo-optimization',
    name: 'turborepo-monorepo-optimization',
    type: 'skill',
    category: 'core',
    tags: ['core', 'monorepo', 'build'],
    desc: 'Dependency graph analysis, Turborepo remote computation caching, pipeline parallelism, and circular dependency prevention.',
    command: 'Loaded on monorepo builds',
    model: 'All models'
  },
  {
    id: 'api-contract',
    name: '/api-contract',
    type: 'command',
    category: 'core',
    tags: ['core', 'api', 'openapi'],
    desc: 'Validates OpenAPI and Protobuf schemas, identifies breaking changes across git commits, and generates mock/contract test suites.',
    command: 'nexus /api-contract --spec api.yaml',
    model: 'architect'
  },
  {
    id: 'docker-build',
    name: '/docker-build',
    type: 'command',
    category: 'security',
    tags: ['security', 'docker', 'devops'],
    desc: 'Hardened multi-stage Docker builds, Hadolint linting, rootless user verification, and distroless container attack surface reduction.',
    command: 'nexus /docker-build --distroless',
    model: 'build-error-resolver'
  }
];

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  setupPackageManagerSwitcher();
  setupCommandCopy();
  setupShowcaseTabs();
  setupCatalogExplorer();
  setupFaqAccordion();
});

// Sticky Navbar Scroll Handler
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.flexDirection = 'column';
        navLinks.style.background = '#0a0d1a';
        navLinks.style.padding = '20px';
        navLinks.style.borderRadius = '14px';
        navLinks.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
      }
    });
  }
}

// Package Manager Switcher
function setupPackageManagerSwitcher() {
  const pmButtons = document.querySelectorAll('.pm-btn');
  const commandText = document.getElementById('install-cmd-text');

  const pmCommands = {
    npx: 'npx nexus-os setup',
    pnpm: 'pnpm dlx nexus-os setup',
    bun: 'bunx nexus-os setup',
    yarn: 'yarn dlx nexus-os setup'
  };

  pmButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pmButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pm = btn.getAttribute('data-pm');
      if (pmCommands[pm] && commandText) {
        commandText.textContent = pmCommands[pm];
      }
    });
  });
}

// Copy Button
function setupCommandCopy() {
  const copyBtn = document.getElementById('copy-cmd-btn');
  const commandText = document.getElementById('install-cmd-text');

  if (copyBtn && commandText) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = commandText.textContent.trim();
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span>✓</span> Copied!`;
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
  }
}

// Architecture Showcase Tabs
function setupShowcaseTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${tabId}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Filterable Catalog Explorer
function setupCatalogExplorer() {
  const grid = document.getElementById('catalog-grid');
  const searchInput = document.getElementById('catalog-search');
  const filterChips = document.querySelectorAll('.chip-btn');

  let activeCategory = 'all';
  let searchTerm = '';

  function renderCards() {
    if (!grid) return;

    const filtered = CATALOG_ITEMS.filter(item => {
      const matchesCategory = activeCategory === 'all' || 
        item.category === activeCategory || 
        item.type === activeCategory;

      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No matching agents, skills, or commands found.</p>
          <p style="font-size: 0.9rem;">Try clearing the search or choosing another category.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const badgeClass = item.type === 'agent' ? 'badge-agent' : item.type === 'skill' ? 'badge-skill' : 'badge-command';
      return `
        <article class="catalog-card">
          <div class="catalog-card-header">
            <span class="badge-tag ${badgeClass}">${item.type}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${item.category}</span>
          </div>
          <h4 class="card-title">${item.name}</h4>
          <p class="card-desc">${item.desc}</p>
          <div class="card-footer">
            <span><code>${item.command.split(' ')[0]}</code></span>
            <span>${item.model}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  // Filter chips click
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-filter');
      renderCards();
    });
  });

  // Search input typing
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderCards();
    });
  }

  // Initial render
  renderCards();
}

// FAQ Accordion
function setupFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}
