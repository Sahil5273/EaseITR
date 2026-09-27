FROM node:22-slim
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm install
COPY server/src ./src
COPY lib/services/document-map.ts /app/lib/services/document-map.ts
COPY lib/domain/types.ts /app/lib/domain/types.ts
RUN npm run build && npm prune --omit=dev
ENV NODE_ENV=production
ENV PORT=8080
CMD ["node", "dist/index.js"]
