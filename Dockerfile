# syntax=docker/dockerfile:1

# ---------- Stage 1: test and build the site ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json manifest.js build.js ./
COPY scripts ./scripts
COPY src ./src
COPY test ./test

# The image build fails if any test fails, so a broken edit can never be deployed.
RUN npm test && node build.js --site

# Self-host the fonts so visitors' browsers never contact Google (good for privacy and GDPR).
# If the download fails the build carries on and the page falls back to Google Fonts.
ARG SELF_HOST_FONTS=1
RUN if [ "$SELF_HOST_FONTS" = "1" ]; then node scripts/self-host-fonts.js dist/site; fi

# ---------- Stage 2: serve it ----------
# nginx-unprivileged runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist/site /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
