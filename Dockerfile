# syntax=docker/dockerfile:1.5
# ============================================================
# Hyperfocus Home Page — Production Dockerfile
# Pattern: HS-137 DOCKER SOVEREIGN (2026 Best Practices)
# Next.js standalone output — target ~140MB production image
# ============================================================

# ── Stage 1: Builder ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first — maximise layer cache
# Cache only busted when package*.json changes
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# next.config.js has output: 'standalone' — produces self-contained bundle
RUN npm run build

# Next.js outputs:
#   .next/standalone/  — server + bundled deps (no node_modules needed at runtime)
#   .next/static/      — static assets
#   public/            — public assets

# ── Stage 2: Runtime ──────────────────────────────────────
FROM node:20-alpine AS runtime

# dumb-init: proper PID 1 signal handling
# Ensures graceful shutdown (SIGTERM → Node → DB connections close cleanly)
RUN apk add --no-cache dumb-init

# Non-root user — no root escalation risk (2026 security standard)
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs -u 1001

WORKDIR /app

# Copy ONLY standalone output from builder — no build tooling in production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Switch to non-root before runtime
USER 1001:1001

ENV NODE_ENV=production
ENV PORT=3000
# NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY injected at runtime
# via -e flags or orchestrator secrets — never hardcoded here

EXPOSE 3000

# Orchestrator health check — root path returns 200 for liveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# dumb-init ensures SIGTERM/SIGINT forwarded correctly to Node process
ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "server.js"]
