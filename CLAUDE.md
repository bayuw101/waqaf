# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                 # Install dependencies
npm run dev                 # Next.js development server (default http://localhost:3000)
npm run test                # Run Vitest tests
npm run check               # Run tests and TypeScript checks
npm run build               # Production build
npm start                   # Serve the production build
npx vitest run src/lib/finance.test.ts  # Run one test file
```

## Architecture

AmanahKas is a Next.js 15 App Router prototype with React 19, TypeScript, Tailwind CSS 4, and Lucide React. It has no backend, authentication, or durable persistence; `FinanceProvider` holds mutable prototype state in memory.

- `src/app/` defines the dashboard, unified transactions, universal transaction detail, reports, and transparency routes.
- `src/lib/finance.ts` is the financial domain boundary. It defines activities/advances and separates `cashEffect`, `incomeEffect`, and `expenseEffect` to prevent transfer and advance settlement double-counting.
- `src/lib/finance-provider.tsx` owns client-side prototype mutations and derives the unified feed from ordinary activities plus advance children.
- `src/components/transactions/` contains the unified list, adaptive six-tab transaction sheet, rows, and universal details. Utang, piutang, and pertanggungjawaban are transaction types—not separate navigation modules.
- `src/components/ui/` is ported from Morfoschools. Reuse these components rather than native selects/date inputs or new visual primitives.
- `src/components/layout/` mirrors Morfoschools AppShell/PageShell behavior: shell-aware light/dark tokens, 66px desktop sidebar, 60px topbar, floating content card, and mobile bottom navigation.
- `src/app/globals.css` is the Morfoschools token source. Use Lucide React for every icon; do not use emoji, symbol glyphs, Font Awesome, or browser-native visible select/date/time controls.

## Product and UI sources

- `PRD.md` is the audited product specification and records unified activity semantics and fund-accountability rules.
- `UI-WIREFRAMES.md` describes the intended Indonesian desktop/mobile flows.
- `PRD.docx` is retained as the original source document.
- Preserve Indonesian (`id-ID`) copy and integer IDR formatting unless product scope changes.
