---
"@better-pwa/core": patch
"@better-pwa/offline": patch
"@better-pwa/storage": patch
"@better-pwa/sw-builder": patch
"@better-pwa/manifest": patch
"better-pwa": patch
"@better-pwa/adapter-react": patch
"@better-pwa/adapter-vue": patch
"@better-pwa/adapter-svelte": patch
"@better-pwa/adapter-next": patch
"@better-pwa/adapter-vite": patch
---

# v1.0.1 — CI Fix and Package Metadata Polish

## Fixed

- **CI**: Resolved `Invalid Version` npm error in GitHub Actions by adding `version` field to root `package.json` and regenerating `package-lock.json` from scratch
- **typedoc**: Updated `typedoc` from `^0.26.0` to `^0.28.0` and `typedoc-plugin-markdown` from `^4.0.0` to `^5.0.0` to resolve peer dependency conflict with `typescript@^5.7`
- **Package metadata**: Added proper `description`, `license`, `repository`, `keywords` fields to all 11 packages
- **Dependencies**: Fixed `@better-logger/core` dependency reference from `^1.0.1` (unpublished) back to `^1.0.0`

## Infrastructure

- Added `docs:dev` and `docs:build` scripts to root `package.json`
- Converted CI and release workflows from pnpm to npm
- Added `typecheck` script for TypeScript validation across packages
- Lock file regenerated cleanly — no pnpm artifacts
