# itoolbox-frontend

**Next.js 15 · React 19 · Tailwind — the web client for the IToolbox Ecosystem Platform.**

> One login, one dashboard, every tool.

## Tech stack

| | |
| --- | --- |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui conventions, IToolbox brand tokens in `app/globals.css` |
| **Markdown** | `react-markdown` + `remark-gfm`, `@tailwindcss/typography` |
| **API contract** | Generated from `itoolbox-backend`'s OpenAPI schema via `openapi-typescript`; see [The API contract](#the-api-contract) |
| **Lint / types** | ESLint 9, `tsc --noEmit` |
| **Build / serve** | Static export (`next build` with `output: "export"`), served by nginx in Docker |

The backend (`itoolbox-backend`) is a separate FastAPI service — this repo only
talks to it over HTTP, through the generated types.

**Status (1 November 2026):**

- Live on the host at port 3100; the team reaches it through Tailscale.
- `/bantai` answers from five Zetaris sources with cited evidence, on NVIDIA Nemotron.
- `/autonomous` and `/intelligence` describe the next two pillars.
- The model picker also lists Nemotron via Meterless, which works while Meterless Nightshift runs on the host, and GPT, Grok and Claude, which need a key or credits, as itoolbox-backend's README explains.

## Layout

The UI has a public landing page, a sign-in portal that previews each module, a
dashboard, and one workspace per module. The heart of it is BantAI, IToolbox's AI
chat assistant, and its three pillars: the AI knowledge base and conversational
agent (`bantai/`), intelligent workflow automation (`autonomous/`), and strategic
intelligence with predictive insights and automated reports (`intelligence/`). Every module's
name, tagline, colour, icon and route comes from `lib/platform-apps.ts`, so the
landing carousel, ticker, hamburger menus and dashboard cards stay in step.

```text
app/
  page.tsx                Landing: BantAI hero, module ticker, module carousel
  (auth)/login/           Sign-in portal with a preview page per module
  dashboard/              Module cards and your recent BantAI investigations
  account/                Account Profile: ID badge, details, change password
  bantai/                 Ask BantAI: the investigating agent (/bantai?id=… replays a run)
  autonomous/             BantAI Intelligent Workflow Automation: storm response first
  intelligence/           BantAI Strategic Intelligence; sources/ browses Zetaris
  tracker/                Project Management (sub-apps planned; no backend routes yet)
  security-settings/      Admin: users, roles, access matrix
  docs/  support/
  agent/  sources/        Redirects from the old routes
components/
  agent/                  Model picker, investigation trail, evidence, answer
  bantai-widget.tsx       Floating Ask BantAI launcher on module pages
  ui/                     shadcn/ui primitives
lib/
  platform-apps.ts        The module list, and who may open each module
  nav.ts                  Each module's sub-pages
  api-client.ts           Typed client for every backend route
  sse.ts                  Reads the agent's server-sent event stream
  auth.ts                 Token storage, apiUrl()
packages/ui/            Shared API contract
  types/
    api.gen.ts            GENERATED — do not edit
    index.ts              Curated aliases over the generated schemas
```

## Running locally

**Development** — Next dev server with hot reload, on port 3100. `next.config.ts`
disables static export whenever `NODE_ENV !== production` and proxies `/api/*`
to `NEXT_PUBLIC_LOCAL_API` (default `http://localhost:8100`):

```bash
npm install && npm run dev        # → localhost:3100
```

**Container** — the same static export, served by nginx:

```bash
(cd ../itoolbox-backend && docker compose up -d)   # api :8100
docker compose up --build -d                       # → localhost:3100
```

`NEXT_PUBLIC_*` values are baked in at **build** time by the static export, so
changing which backend the site talks to needs a rebuild, not a restart. When
the API is somewhere else — a teammate's machine over Tailscale, say — set it:

```bash
NEXT_PUBLIC_API_URL=https://<host>.<tailnet>.ts.net:8443 npm run dev
```

Copy `.env.example` to `.env.local` first. Only `NEXT_PUBLIC_*` values belong in
this repo — they ship to the browser. Model API keys, the JWT secret and the
Zetaris credentials live in `itoolbox-backend`, never here.

## The BantAI page

`POST /api/v1/agent/ask` streams the investigation as server-sent events.
`lib/sse.ts` reads them with `fetch` (EventSource can't POST or send the
Authorization header), and `components/agent/investigation.ts` folds each event
into the view. The same reducer replays a stored investigation from
`GET /api/v1/agent/investigations/{id}`, so a past run renders exactly as it did
live, and `/bantai?id=…` links can be shared. `/bantai?q=…` starts an
investigation; the floating widget and the sign-in portal hand questions over
that way.

Every model in the picker is a real LLM: NVIDIA Nemotron (direct, or routed
through Meterless Nightshift), OpenAI GPT, xAI Grok and Anthropic Claude. A model
without credentials on the server stays listed as "(not configured)".

## The API contract

`packages/ui/types/api.gen.ts` is generated from `itoolbox-backend`'s committed
OpenAPI schema and is checked in, so this repo builds without the backend
present.

```bash
npm install
npm run gen:types        # reads ../itoolbox-backend/contract/openapi.api.json
```

Override the location with `ITOOLBOX_CONTRACT_DIR` if your `itoolbox-backend`
checkout isn't a sibling directory.

Regenerate whenever the backend changes a route or response model. On the
backend side, `python scripts/export_openapi.py --check` fails CI when the
committed schema has gone stale.

`index.ts` puts stable, domain-meaningful names on the generated schemas —
`DataSource` rather than FastAPI's `SourceOut`. Edit that file freely; never edit
`api.gen.ts`.
