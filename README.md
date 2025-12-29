# Cloudflare Workers Multi-Entity Chat Demo

[![Deploy to Cloudflare]([cloudflarebutton])]([cloudflarebutton])

A production-ready full-stack chat application demonstrating Cloudflare Workers with Durable Objects. Features multiple entities (Users, ChatBoards, Messages) sharing a single Global Durable Object for efficient state management, indexed listing, and real-time messaging. Built with a modern React frontend using Vite, Tailwind CSS, and shadcn/ui.

## Features

- **Multi-Entity Durable Objects**: Users, ChatBoards, and Messages with automatic indexing for listing/pagination.
- **Type-Safe TypeScript**: Shared types between worker and frontend.
- **React Frontend**: Responsive UI with TanStack Query, React Router, and shadcn/ui components.
- **Hono API**: Clean, typed API routes with CORS and error handling.
- **Seed Data**: Mock users, chats, and messages auto-populate on first run.
- **Production-Ready**: Includes health checks, client error reporting, theme support, and Tailwind animations.
- **Zero-Cold-Start**: Durable Objects ensure instant state access.

## Tech Stack

- **Backend**: Cloudflare Workers, Durable Objects, Hono
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React
- **State/Data**: TanStack Query, Zustand, Immer, Zod
- **UI/UX**: Framer Motion, Sonner Toasts, Headless UI
- **Dev Tools**: Bun, ESLint, Wrangler

## Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh/) installed
   - [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated (`wrangler login`)

2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   bun install
   ```

3. **Generate Types** (one-time):
   ```bash
   bun run cf-typegen
   ```

4. **Development**:
   ```bash
   bun dev
   ```
   - Frontend serves on `http://localhost:3000` (or `$PORT`)
   - API available at `/api/*`

5. **Deploy**:
   ```bash
   bun deploy
   ```

## Development

### Local Development Workflow

- **Frontend**: `bun dev` (Vite dev server)
- **Worker Preview**: `wrangler dev` (full-stack local emulation with Durable Objects)
- **Type Generation**: `bun run cf-typegen` after worker changes
- **Linting**: `bun lint`
- **Build**: `bun build` (produces `dist/` for Pages deployment)

### Project Structure

```
├── src/              # React frontend (Vite)
├── worker/           # Cloudflare Worker API (Hono + Durable Objects)
├── shared/           # Shared TypeScript types
├── tailwind.config.js # Tailwind + shadcn/ui config
└── wrangler.jsonc    # Worker deployment config
```

### Adding New Entities

1. Extend `IndexedEntity` in `worker/entities.ts`:
   ```typescript
   export class NewEntity extends IndexedEntity<NewEntityState> {
     static readonly entityName = "newentity";
     static readonly indexName = "newentities";
     static readonly initialState: NewEntityState = { id: "", ... };
   }
   ```

2. Add API routes in `worker/user-routes.ts` using entity statics (list, create, delete, etc.).

3. Frontend: Use `api()` helper from `@/lib/api-client.ts` for data fetching/mutations.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (supports `?cursor` & `?limit`) |
| POST | `/api/users` | Create user `{ name: string }` |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/deleteMany` | Bulk delete `{ ids: string[] }` |
| GET | `/api/chats` | List chats |
| POST | `/api/chats` | Create chat `{ title: string }` |
| GET | `/api/chats/:chatId/messages` | List messages |
| POST | `/api/chats/:chatId/messages` | Send message `{ userId: string, text: string }` |

All responses: `{ success: boolean, data?: T, error?: string }`

## Deployment

Deploy to Cloudflare Workers with Pages for static assets:

1. **Configure Wrangler**:
   - Update `wrangler.jsonc` with your account ID if needed.
   - Set `wrangler.toml` secrets: `wrangler secret put <NAME>`.

2. **One-Command Deploy**:
   ```bash
   bun deploy
   ```
   - Builds frontend (`dist/`).
   - Deploys Worker + assets via Wrangler.

3. **Custom Domain**:
   ```
   wrangler pages deploy dist --project-name=<pages-project> --production
   wrangler deploy --production
   ```

[![Deploy to Cloudflare]([cloudflarebutton])]([cloudflarebutton])

## Customization

- **UI Components**: Add/edit in `src/components/ui/` (shadcn CLI: `bunx shadcn@latest add <component>`).
- **Theme**: Toggle via `useTheme()` hook; edit CSS vars in `src/index.css`.
- **Routes**: Add React Router routes in `src/main.tsx`.
- **Entities**: See `worker/entities.ts` for examples.
- **Sidebar**: Customize `src/components/app-sidebar.tsx`.

## Troubleshooting

- **Worker Routes Fail**: Check `worker/user-routes.ts`; restart dev server.
- **Types Missing**: Run `bun run cf-typegen`.
- **Durable Objects**: Ensure `GlobalDurableObject` binding in `wrangler.jsonc`.
- **CORS Issues**: Defaults allow `*` for dev; restrict in prod.

## License

MIT. See [LICENSE](LICENSE) for details.

---

Built with ❤️ for Cloudflare Workers. Questions? [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)