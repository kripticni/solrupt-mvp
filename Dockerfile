# One image: API + static frontend (15 §7, 19 §1). HF Spaces serves port 7860.
# Docker base pins: node v22.23.3 to match mvp/PINS.md (local v24 is dev-only).
FROM node:22.23.3-bookworm-slim AS webbuild
WORKDIR /build/apps/web
COPY mvp/apps/web/package.json mvp/apps/web/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY mvp/apps/web/ ./
RUN npm run build

FROM node:22.23.3-bookworm-slim
WORKDIR /srv
ENV PORT=7860
COPY --from=webbuild /build/apps/web/build ./build
COPY mvp/content ./content
COPY mvp/schema.sql ./schema.sql
COPY mvp/verifier-ts ./verifier-ts
EXPOSE 7860
CMD ["node", "./build"]
