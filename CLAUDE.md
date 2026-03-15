# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build
```

## Architecture

**Business management dashboard** (sales, products, customers, discounts, salespersons) connected to an ASP.NET Core MVC API.

### Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (configured via `@tailwindcss/vite`, no separate config file)
- shadcn/ui components in `src/components/ui/`
- React Router v7 (`createBrowserRouter`)
- Zustand v5 for state management
- TanStack React Table v8

### Path Alias

`@/*` → `./src/*` — configured in both `vite.config.ts` and `tsconfig.app.json` **and** the root `tsconfig.json` (required for shadcn CLI detection).

### State / Data Flow

- `src/store/api.ts` — fetch wrapper; base URL from `API_BASE_URL` in `.env`
- `src/store/types.ts` — all entity interfaces + `PagedResult<T>` (`{ items, count, cursor }`)
- One Zustand store per entity in `src/store/`. All exports are named `useXxxStore`.
- `ProductStore` is the reference implementation for server-side pagination/sort/search. Other entity stores are simpler (no pagination state).

### Server-side Pagination (Products API)

Query params: `page` (0-based int), `count` (page size), `sortBy` (lowercase, e.g. `purchaseprice`), `ascending` (bool), `search` (optional string).
Response: `PagedResult<T>` — use `cursor` to determine if a next page exists (`null` = no next page), `count` for total record count.
`SORT_KEY_MAP` in `products.tsx` maps camelCase field names to the lowercase API keys.

### Theme System

Custom `ThemeProvider` at `src/components/theme-provider.tsx` applies `.dark` class to `<html>`. **Do not** use `next-themes` — it is installed but conflicts with this provider.
Tailwind v4 dark variant is configured with `@custom-variant dark (&:is(.dark, .dark *))` in `index.css`.

### CSS Cascade Notes (`src/index.css`)

Tailwind v4 uses CSS layers. Unlayered CSS rules override `@layer utilities`, so all base typography rules (`h1`, `h2`, `code`, `.counter`) are inside `@layer base` so Tailwind utilities can override them.
Dark mode CSS variables exist in both `@media (prefers-color-scheme: dark)` (system preference) and `.dark` class (class-based toggle) — both must be kept in sync when adding new custom vars.

### API

This project is based on the API project configured at "../prof-c-sharp-mvc" where the controller names and data models match the store and page names

### Best Practices

Ensure zustand best practices are followed to minimize rerender
Ensure react best practices are followed to minimize rerender
Adhere to DRY principles
