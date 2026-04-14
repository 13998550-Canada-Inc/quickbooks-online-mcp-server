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
# Install production dependencies (skip prepare/build scripts) and supergateway
RUN npm ci --ignore-scripts --omit=dev && \
    npm install -g supergateway
EXPOSE 3000
# supergateway bridges the stdio-based MCP server to Streamable HTTP transport.
# The MCP endpoint is POST /mcp (same shape as Brave and MS-365).
ENTRYPOINT ["supergateway", "--stdio", "node /app/dist/index.js", "--port", "3000", "--outputTransport", "streamable-http"]
