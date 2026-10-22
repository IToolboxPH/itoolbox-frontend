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

## Layout

```text
app/
  (auth)/login/     Sign-in
  agent/            Ask Why — the investigating agent
  sources/          Data sources the agent can see (through Zetaris)
components/
  agent/            Question form, model picker, investigation trail, evidence, answer
  ui/               shadcn/ui primitives
lib/
  api-client.ts     Typed client for every backend route
  sse.ts            Reads the agent's server-sent event stream
  auth.ts           Token storage, apiUrl()
packages/ui/      Shared API contract
  types/
    api.gen.ts      GENERATED — do not edit
    index.ts        Curated aliases over the generated schemas
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

## The agent page

`POST /api/v1/agent/ask` streams the investigation as server-sent events.
`lib/sse.ts` reads them with `fetch` (EventSource can't POST or send the
Authorization header), and `components/agent/investigation.ts` folds each event
into the view. The same reducer replays a stored investigation from
`GET /api/v1/agent/investigations/{id}`, so a past run renders exactly as it did
live, and `/agent?id=…` links can be shared.

Pick **Demo (no LLM)** in the model picker to run a scripted investigation over
live data: the full event stream, with no model credits spent.

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
