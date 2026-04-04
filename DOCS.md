---
# Documentation Site Blueprint: better-pwa/docs

| Metadata | Details |
|----------|---------|
| **Project** | `better-pwa` |
| **Version** | 1.0 (Draft) |
| **Last Updated** | 2026-04-04 |
| **Target** | GitHub Pages (static HTML) |

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Site Structure](#2-site-structure)
3. [File Organization](#3-file-organization)
4. [Page Templates](#4-page-templates)
5. [Content Strategy](#5-content-strategy)
6. [GitHub Actions Pipeline](#6-github-actions-pipeline)
7. [Local Development](#7-local-development)
8. [Auto-Generated Content](#8-auto-generated-content)
9. [Search & Navigation](#9-search--navigation)
10. [Deployment Flow](#10-deployment-flow)
11. [Styling & Theme](#11-styling--theme)
12. [Performance Targets](#12-performance-targets)

---

## 1. Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| **Static Site Generator** | [Eleventy (11ty)](https://www.11ty.dev/) | Zero JS runtime, Markdown-native, fast builds, GitHub Pages native |
| **Templating** | Nunjucks | Familiar syntax, includes/layouts, data inheritance |
| **CSS** | Plain CSS + CSS Variables | No build step, instant load, dark mode via `prefers-color-scheme` |
| **Syntax Highlighting** | [Prism.js](https://prismjs.com/) | Lightweight, TypeScript support, line numbers |
| **Search** | [Lunr.js](https://lunrjs.com/) | Client-side, zero server, indexes at build time |
| **Navigation** | Static sidebar + TOC per page | Fast, no JS framework overhead |
| **Hosting** | GitHub Pages (`gh-pages` branch) | Free, auto-deploy via Actions, custom domain support |
| **Diagram Rendering** | Mermaid.js (client-side) | No server rendering needed, GitHub-native syntax |

**Why not Next.js / VitePress / Docusaurus?**

- Next.js: Overkill for static docs. Requires Node runtime at build time.
- Docusaurus: React dependency for what is fundamentally Markdown rendering.
- VitePress: Good, but Eleventy gives more control over output structure and is lighter.

Eleventy outputs **pure HTML/CSS/JS** — no framework, no hydration, instant load.

---

## 2. Site Structure

```
better-pwa/
├── docs/                          # Documentation site source
│   ├── src/
│   │   ├── _includes/             # Layout templates (Nunjucks)
│   │   │   ├── layouts/
│   │   │   │   ├── base.njk       # HTML shell, head, scripts
│   │   │   │   ├── docs.njk       # Docs page with sidebar + TOC
│   │   │   │   └── api.njk        # API reference layout
│   │   │   ├── components/
│   │   │   │   ├── sidebar.njk    # Left navigation
│   │   │   │   ├── toc.njk        # Right-side TOC
│   │   │   │   ├── breadcrumbs.njk
│   │   │   │   ├── version-badge.njk
│   │   │   │   └── callout.njk    # Note/warning/tip boxes
│   │   │   └── partials/
│   │   │       ├── header.njk
│   │   │       ├── footer.njk
│   │   │       └── search.njk
│   │   │
│   │   ├── pages/                 # Site pages
│   │   │   ├── index.md           # Landing page (/)
│   │   │   └── playground.md      # Interactive demo (/playground)
│   │   │
│   │   └── content/               # Documentation content
│   │       ├── getting-started/
│   │       │   ├── _section.json  # Section metadata (order, title)
│   │       │   ├── introduction.md
│   │       │   ├── quick-start.md
│   │       │   ├── installation.md
│   │       │   └── mental-model.md
│   │       │
│   │       ├── concepts/
│   │       │   ├── _section.json
│   │       │   ├── state-engine.md
│   │       │   ├── lifecycle.md
│   │       │   ├── service-worker.md
│   │       │   ├── offline-data.md
│   │       │   ├── multi-tab.md
│   │       │   └── cold-start.md
│   │       │
│   │       ├── guides/
│   │       │   ├── _section.json
│   │       │   ├── migrate-from-workbox.md
│   │       │   ├── react-integration.md
│   │       │   ├── vue-integration.md
│   │       │   ├── nextjs-integration.md
│   │       │   ├── offline-first-app.md
│   │       │   ├── ecommerce-pwa.md
│   │       │   └── debugging-guide.md
│   │       │
│   │       ├── api/
│   │       │   ├── _section.json
│   │       │   ├── index.md          # API overview
│   │       │   ├── createPwa.md
│   │       │   ├── pwa-state.md
│   │       │   ├── pwa-update.md
│   │       │   ├── pwa-permissions.md
│   │       │   ├── pwa-offline.md
│   │       │   ├── pwa-storage.md
│   │       │   ├── pwa-auth.md
│   │       │   ├── pwa-network.md
│   │       │   ├── pwa-audit.md
│   │       │   ├── pwa-policy.md
│   │       │   ├── pwa-migrations.md
│   │       │   ├── pwa-priority.md
│   │       │   ├── pwa-capabilities.md
│   │       │   ├── pwa-flags.md
│   │       │   ├── pwa-recovery.md
│   │       │   ├── pwa-metrics.md
│   │       │   └── pwa-telemetry.md
│   │       │
│   │       ├── internals/
│   │       │   ├── _section.json
│   │       │   ├── architecture.md
│   │       │   ├── state-machine.md
│   │       │   ├── data-flow.md
│   │       │   ├── security.md
│   │       │   └── performance.md
│   │       │
│   │       ├── recipes/
│   │       │   ├── _section.json
│   │       │   ├── optimistic-updates.md
│   │       │   ├── custom-conflict-resolution.md
│   │       │   ├── gradual-rollout.md
│   │       │   ├── offline-checkout.md
│   │       │   └── multi-tab-dashboard.md
│   │       │
│   │       ├── guarantees/
│   │       │   ├── _section.json
│   │       │   ├── overview.md
│   │       │   ├── data-durability.md
│   │       │   ├── update-safety.md
│   │       │   ├── cross-tab.md
│   │       │   ├── permission-resilience.md
│   │       │   ├── cold-start.md
│   │       │   ├── auth-continuity.md
│   │       │   └── audit-completeness.md
│   │       │
│   │       └── troubleshooting/
│   │           ├── _section.json
│   │           ├── common-errors.md
│   │           ├── safari-quirks.md
│   │           ├── sw-not-registering.md
│   │           ├── offline-not-working.md
│   │           └── faq.md
│   │
│   ├── public/                    # Static assets
│   │   ├── css/
│   │   │   ├── base.css
│   │   │   ├── docs.css
│   │   │   ├── prism.css
│   │   │   └── dark.css
│   │   ├── js/
│   │   │   ├── search.js
│   │   │   ├── mermaid.js
│   │   │   └── nav.js
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── og-image.png
│   │   │   └── diagrams/
│   │   └── favicon.ico
│   │
│   ├── _data/                     # Eleventy global data
│   │   ├── site.json              # Site metadata (title, URL, description)
│   │   ├── nav.json               # Navigation structure
│   │   └── version.json           # Current version, release date
│   │
│   ├── .eleventy.js               # Eleventy config
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── deploy-docs.yml        # Deploy docs to GitHub Pages
│       ├── ci.yml                 # Build, test, lint
│       └── release.yml            # Auto-version + npm publish
│
├── examples/                      # Live demo examples
│   ├── saas/
│   ├── ecommerce/
│   └── offline-first/
│
└── packages/                      # Monorepo packages
    ├── core/
    ├── offline/
    ├── storage/
    ├── cli/
    └── adapters/
```

---

## 3. File Organization

### 3.1 Content File Format

Every `.md` file uses frontmatter:

```markdown
---
title: "State Engine"
description: "How pwa.state() works as the single source of truth"
order: 2
version: "v0.1+"
category: "concepts"
---

# State Engine

Content here...
```

### 3.2 Section Metadata (`_section.json`)

```json
{
  "title": "Getting Started",
  "order": 1,
  "icon": "rocket"
}
```

### 3.3 Navigation Data (`_data/nav.json`)

```json
{
  "sections": [
    {
      "title": "Getting Started",
      "path": "/getting-started/",
      "items": [
        { "title": "Introduction", "path": "/getting-started/introduction/" },
        { "title": "Quick Start", "path": "/getting-started/quick-start/" },
        { "title": "Installation", "path": "/getting-started/installation/" },
        { "title": "Mental Model", "path": "/getting-started/mental-model/" }
      ]
    },
    {
      "title": "Concepts",
      "path": "/concepts/",
      "items": [
        { "title": "State Engine", "path": "/concepts/state-engine/" },
        { "title": "Lifecycle", "path": "/concepts/lifecycle/" }
      ]
    }
  ]
}
```

---

## 4. Page Templates

### 4.1 Base Layout (`base.njk`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} — better-pwa</title>
  <meta name="description" content="{{ description }}">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/docs.css">
  <link rel="stylesheet" href="/css/prism.css">
  <link rel="stylesheet" href="/css/dark.css" media="(prefers-color-scheme: dark)">
  <script src="/js/mermaid.js" defer></script>
</head>
<body>
  {% include "partials/header.njk" %}
  <main>{{ content | safe }}</main>
  {% include "partials/footer.njk" %}
  <script src="/js/nav.js" defer></script>
  <script src="/js/search.js" defer></script>
</body>
</html>
```

### 4.2 Docs Layout (`docs.njk`)

```html
{% extends "layouts/base.njk" %}

{% block content %}
<div class="docs-layout">
  <aside class="sidebar">
    {% include "components/sidebar.njk" %}
  </aside>

  <article class="docs-content">
    {% include "components/breadcrumbs.njk" %}
    <h1>{{ title }}</h1>
    {% include "components/version-badge.njk" %}

    <div class="content-body">
      {{ content | safe }}
    </div>

    <div class="page-footer">
      <a href="{{ prev.path }}">← {{ prev.title }}</a>
      <a href="{{ next.path }}">{{ next.title }} →</a>
    </div>
  </article>

  <aside class="toc-sidebar">
    {% include "components/toc.njk" %}
  </aside>
</div>
{% endblock %}
```

### 4.3 Callout Component (`callout.njk`)

```html
<div class="callout {{ type }}">
  <div class="callout-icon">{% if type === "warning" %}⚠️{% elif type === "tip" %}💡{% else %}ℹ️{% endif %}</div>
  <div class="callout-content">{{ content | safe }}</div>
</div>
```

Usage in Markdown:

```markdown
{% callout type="warning" %}
Offline mutation replay requires server-side idempotency support.
Ensure your API handles duplicate requests gracefully.
{% endcallout %}
```

---

## 5. Content Strategy

### 5.1 Writing Style (Non-Negotiable)

| Rule | Example |
|------|---------|
| **Lead with outcome** | "Your users can submit forms offline. Here's how it works." |
| **Show failure scenarios** | "What happens if the browser crashes mid-sync?" |
| **Concrete before abstract** | Code example first, then explanation |
| **Every API page has** | Signature, parameters, return type, example, error cases |
| **Every concept page has** | Mental model diagram, when to use, when not to use |

### 5.2 Page Anatomy (Standard)

```
1. One-line summary
2. When to use this (and when not to)
3. Quick example (3-5 lines of code)
4. Detailed explanation
5. API reference (signature, params, returns)
6. Error handling ("What goes wrong?")
7. Related pages
```

### 5.3 Content That Drives Adoption

| Page | Purpose |
|------|---------|
| **"Migrate from Workbox"** | Capture existing PWA devs who are frustrated |
| **"What Happens When Things Go Wrong"** | Prove reliability claims with failure walkthroughs |
| **"Offline Checkout Flow"** | Show, don't tell — interactive demo |
| **"Debug Like a God"** | Showcase simulation features |
| **"Enterprise Guide"** | Audit logs, policy engine, SLA metrics |

---

## 6. GitHub Actions Pipeline

### 6.1 Deploy Docs (`deploy-docs.yml`)

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'packages/core/src/**/*.ts'  # Auto-regenerate API docs

  workflow_dispatch:  # Manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Generate API docs from TypeScript
        run: pnpm --filter @better-pwa/core run docs:generate

      - name: Build docs site
        run: pnpm --filter docs build
        env:
          NODE_ENV: production

      - name: Run link checker
        run: pnpm --filter docs lint:links

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/_site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 6.2 CI Pipeline (`ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - run: pnpm --filter docs build  # Docs must build cleanly
```

### 6.3 Auto-Release (`release.yml`)

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install

      - name: Create Release PR
        uses: changesets/action@v1
        with:
          publish: pnpm release
          title: "Release"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Trigger docs deploy
        if: steps.changesets.outputs.published == 'true'
        run: gh workflow run deploy-docs.yml
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 7. Local Development

```bash
# From project root
cd docs

# Install
pnpm install

# Dev server (auto-rebuild on changes)
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Check for broken links
pnpm lint:links
```

Eleventy's dev server runs on `localhost:8080` with hot reload. No framework overhead.

---

## 8. Auto-Generated Content

### 8.1 API Docs from TypeScript

```bash
# packages/core/package.json
{
  "scripts": {
    "docs:generate": "typedoc src/index.ts --out ../../docs/src/content/api/ --json"
  }
}
```

[Typedoc](https://typedoc.org/) parses TypeScript JSDoc and generates Markdown pages. These are committed to the docs repo so they're versioned with the code.

### 8.2 Changelog from Changesets

```bash
# Auto-generated from changesets
docs/src/content/changelog.md
```

### 8.3 Feature Registry

```bash
# Auto-generated from FEATURES.md feature matrix
docs/_data/features.json
```

This keeps docs in sync with source truth documents. No manual drift.

---

## 9. Search & Navigation

### 9.1 Client-Side Search (Lunr.js)

```javascript
// Built at docs build time
// _site/search-index.json

{
  "pages": [
    {
      "title": "State Engine",
      "url": "/concepts/state-engine/",
      "content": "The state engine is the single source of truth...",
      "category": "concepts"
    }
  ]
}
```

Search is instant — no network requests, index loads in <50ms.

### 9.2 Sidebar Navigation

- Left sidebar: section tree (collapsible)
- Right sidebar: page TOC (H2/H3 headings)
- Breadcrumbs: top of each page
- Prev/Next: bottom of each page
- Active page highlighted in sidebar
- Scroll-spy: TOC highlights current section as you scroll

---

## 10. Deployment Flow

```
Push to main
    │
    ▼
CI: Test + Build (ci.yml)
    │
    ▼
Docs build (deploy-docs.yml)
    │
    ├── Generate API docs from TypeScript
    ├── Build Eleventy site → _site/
    ├── Link checker
    │
    ▼
Deploy to GitHub Pages (gh-pages branch)
    │
    ▼
Live at better-pwa.github.io/docs
    │
    (optional) Custom domain: docs.better-pwa.com
```

---

## 11. Styling & Theme

### 11.1 Design Tokens

```css
/* css/base.css */
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-primary: #6366f1;    /* Indigo */
  --color-primary-hover: #4f46e5;
  --color-code-bg: #f8f9fa;
  --color-border: #e5e7eb;
  --color-callout-info-bg: #eff6ff;
  --color-callout-warn-bg: #fefce8;
  --color-callout-error-bg: #fef2f2;
  --sidebar-width: 280px;
  --toc-width: 220px;
  --max-content-width: 800px;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-text: #e2e8f0;
    --color-code-bg: #1e293b;
    --color-border: #334155;
    --color-callout-info-bg: #1e3a5f;
    --color-callout-warn-bg: #422006;
    --color-callout-error-bg: #450a0a;
  }
}
```

### 11.2 Layout

```
┌──────────────────────────────────────────────────────┐
│  Header: Logo + Search + Version + GitHub Link       │
├──────────┬──────────────────────────────┬────────────┤
│ Sidebar  │  Content (max-width: 800px)  │ TOC        │
│ (280px)  │                              │ (220px)    │
│          │  H1: State Engine            │            │
│ Concepts │  ─────────────────           │ Overview   │
│ ├ State  │  Code example               │ State      │
│ ├ Update │  Detailed explanation       │ API        │
│ └ Perms  │  Error handling             │ Errors     │
│          │                              │ Related    │
│ Guides   │  ← Previous  |  Next →      │            │
│ └ Migrate│                              │            │
│          │  Footer: Version + Edit link │            │
├──────────┴──────────────────────────────┴────────────┤
│  Footer: better-pwa · MIT · GitHub                   │
└──────────────────────────────────────────────────────┘
```

---

## 12. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint** | <1s | Lighthouse |
| **Largest Contentful Paint** | <1.5s | Lighthouse |
| **Total JS (gzipped)** | <30KB | Chrome DevTools |
| **Total CSS (gzipped)** | <10KB | Chrome DevTools |
| **Search index load** | <50ms | Performance API |
| **Lighthouse Performance** | ≥95 | CI check |
| **Lighthouse Accessibility** | ≥95 | CI check |
| **Lighthouse SEO** | 100 | CI check |
| **Lighthouse Best Practices** | ≥95 | CI check |

---

## 13. Next Steps

1. **Initialize Eleventy project** in `docs/`
2. **Create `_data/nav.json`** with full navigation
3. **Build base templates** (`base.njk`, `docs.njk`)
4. **Migrate existing docs** (PRD, Architecture, Features, Guarantees) into `content/`
5. **Set up GitHub Actions** (`deploy-docs.yml`)
6. **Configure GitHub Pages** → deploy from `gh-pages` branch
7. **Add Lunr.js search** with build-time index generation
8. **Add Typedoc integration** for auto-generated API pages
9. **Deploy to `better-pwa.github.io/docs`**
10. **Add custom domain** (optional): `docs.better-pwa.com`

---

*This document is the blueprint for the documentation site. Implementation should follow this structure exactly — consistency across pages is non-negotiable.*
