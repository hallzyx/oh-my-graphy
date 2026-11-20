# Oh My Graphy

Use React, TypeScript, shadcn/ui and UI SDK. Before using UI SDK, read its skill at `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md` and the installed documentation index at `node_modules/@ui-sdk/react/docs/llms.txt`. Import components from their own package entries.

Run `npm test` and `npm run build` before delivery. Keep model validation and exports covered by tests. Preserve the JSON format version or provide migrations.

Docker must never publish host ports. Keep `compose.yaml` free of `ports` and fixed Traefik host rules. The web server listens internally on 8080. Dokploy owns domain routing, networks and TLS.
