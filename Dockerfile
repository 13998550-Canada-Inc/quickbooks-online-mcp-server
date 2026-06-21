FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS release
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
ENV NODE_ENV=production
# Install production dependencies (skip prepare/build scripts).
RUN npm ci --ignore-scripts --omit=dev
EXPOSE 3000
# The server hosts Streamable HTTP natively (express) on :3000 so it can read the
# per-request X-QB-* credential headers — supergateway is gone because it could
# not forward per-request HTTP headers into the stdio child.
# The MCP endpoint is POST /mcp (same shape as Brave and MS-365).
ENTRYPOINT ["node", "/app/dist/index.js"]
