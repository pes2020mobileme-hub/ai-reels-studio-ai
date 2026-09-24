FROM node:22-slim AS build
WORKDIR /app

COPY package.json ./

# This repo ships only bun.lock (no package-lock.json), so install via npm
# directly instead of `npm ci`.
RUN npm install

COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY server.ts ./server.ts
COPY tsconfig.json ./tsconfig.json

EXPOSE 10000

CMD ["npx", "tsx", "server.ts"]