---
name: review-vue-nuxt-architecture
description: Use when reviewing whether this Nuxt 4 codebase's structure and responsibility boundaries are coherent — auditing feature structure, refactoring folders/files, or checking adherence to keep-simple principles.
---

# Review Vue/Nuxt Architecture

## Purpose
Review whether the project structure and responsibility boundaries are coherent for this Nuxt 4 codebase.

## Use when
- Reviewing feature structure
- Refactoring folders/files
- Auditing maintainability
- Checking if code follows keep-simple principles

## Review points
- Are pages acting only as route-level orchestrators?
- Are components too large or mixing concerns?
- Are composables cohesive or becoming dumping grounds?
- Is server logic correctly placed in `server/`?
- Is middleware limited to navigation concerns?
- Are names specific and domain-oriented (PascalCase components grouped by feature, `use*` composables)?
- Is localized text in `i18n/locales/*.json` and localized content in `content/` (not hardcoded)?
- Are there unnecessary wrapper abstractions around Nuxt primitives?
- Does the structure make the app easier to understand for a new developer?

## Deliverable
Return:
1. What is coherent
2. What is structurally risky
3. What should be moved, split, or renamed
4. The smallest effective reorganization
