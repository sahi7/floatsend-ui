# FloatSend UI

Production control-plane dashboard for FloatSend — a transactional email platform.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router, TanStack Query / Table
- React Hook Form + Zod
- Axios, Lucide icons, shadcn-style Radix primitives

## Getting started

```bash
npm install
npm run dev
```

Configure environment (optional):

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API origin (empty in dev uses Vite proxy) |
| `VITE_API_PROXY_TARGET` | Local backend (`http://localhost:8080`) |
| `VITE_DEBUG_AUTH` | Set `1` to send `X-Debug-Auth` and surface dev tokens |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |

## App routes (customer v2)

| Path | Screen |
|------|--------|
| `/` | Welcome |
| `/login`, `/signup` | Auth |
| `/verify-email` | Email verification |
| `/mfa` | MFA challenge |
| `/forgot-password`, `/reset-password` | Password reset |
| `/home` | Analytics + setup checklist |
| `/domains`, `/domains/new`, `/domains/:id` | Domains + wizard |
| `/api-keys`, `/api-keys/new` | API keys |
| `/send` | Send console (policy gates + status poll) |
| `/activity` | Email activity (filters, search) |
| `/webhooks`, `/webhooks/new`, `/webhooks/:id` | Webhooks |
| `/billing` | Usage + estimated charges |
| `/billing/plans` | Upgrade / change plan |
| `/billing/profile` | Invoice billing profile |
| `/billing/invoices`, `/billing/invoices/:id` | On-demand invoices + PDF |
| `/settings/security` | Sessions, MFA, password |
| `/settings/team` | Members + invites |
| `/invitations/:token` | Accept/decline invite |

### v2 notes

- **Send policy:** production From requires verified domain; otherwise owner-test or platform shared (`VITE_PLATFORM_SHARED_FROM`).
- **Async delivery:** 202 is not delivered — console polls `GET /v1/emails/:message_id` with API key.
- **Webhooks:** JWT create/list; one-time secret; deliveries + dead letters; signature docs.

## Project structure

```
src/
├── app/           # providers, router, layouts
├── components/    # ui + shared
├── pages/         # route screens
├── services/      # API modules
├── hooks/
├── lib/           # client, storage, utils
├── types/
├── styles/
└── main.tsx
```
