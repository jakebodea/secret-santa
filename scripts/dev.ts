/**
 * `bun run dev`: `alchemy dev` on this worktree's own stage (`dev-<worktree>`)
 * and port, so parallel worktrees never share state or collide on a port.
 * Extra arguments pass through (e.g. `bun run dev -- --profile admin`).
 */
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";

import { devPort, developmentStage } from "../stacks/stage.ts";

const worktree = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf-8",
}).trim();
const stage = developmentStage(path.basename(worktree));
process.stdout.write(`Stage ${stage} → http://localhost:${devPort(stage)}\n`);

const result = spawnSync(
  "bunx",
  ["alchemy", "dev", "--stage", stage, ...process.argv.slice(2)],
  { stdio: "inherit" }
);
process.exit(result.status ?? 1);
