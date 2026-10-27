FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend --include-workspace-root --omit=dev
COPY backend ./backend
# The seed script reads the demo catalog from the frontend mock data.
COPY frontend/src/mocks ./frontend/src/mocks
WORKDIR /app/backend
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:5000/api/health >/dev/null || exit 1
CMD ["node", "src/server.js"]
