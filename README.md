# Super Simple Secret Santa

A simple web app for organizing Secret Santa gift exchanges. Add participants, set constraints for who shouldn't give to whom, and automatically generate random assignments. Live at [supersimplesecretsanta.com](https://supersimplesecretsanta.com).

Runs on Cloudflare Workers (TanStack Start) and sends mail through Cloudflare Email Service. All infrastructure is declared in [`alchemy.run.ts`](alchemy.run.ts) and deployed with [Alchemy](https://alchemy.run).

## Development

```bash
bun install
bun run dev
```

`bun run dev` starts `alchemy dev` on a stage named after your worktree. Emails are written to `.alchemy/local/email` instead of being sent. It needs an Alchemy profile (`bunx alchemy profile`) with an Infisical identity for the dev secrets project.

See [AGENTS.md](AGENTS.md) for the repo map and rules.
