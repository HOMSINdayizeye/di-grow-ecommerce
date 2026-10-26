# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
RUN npm ci --workspace=frontend --include-workspace-root
COPY frontend ./frontend
ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ARG VITE_USE_MOCK=false
ARG VITE_SITE_URL=https://digrow.rw
ENV VITE_API_URL=$VITE_API_URL VITE_SOCKET_URL=$VITE_SOCKET_URL VITE_USE_MOCK=$VITE_USE_MOCK VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build --workspace=frontend

# Serve stage
FROM nginx:1.27-alpine
COPY infrastructure/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
