# ──────────────────────────────────────────────────────────────────────────────
# Dockerfile — transaction-notify-service
# Multi-stage build: deps → production image
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy manifests first for Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:18-alpine AS production

# Create non-root user for security (matches k8s runAsUser: 1001)
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy installed deps from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/
COPY package*.json ./

# Own the app directory
RUN chown -R appuser:appgroup /app

# Create writable /tmp for express temp files
RUN mkdir -p /tmp && chown appuser:appgroup /tmp

USER appuser

EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1

CMD ["node", "src/index.js"]