FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:selfhost

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist/standalone ./dist/standalone
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/selfhost ./selfhost
COPY --from=build /app/node_modules/postgres ./node_modules/postgres
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["sh", "-c", "node scripts/selfhost-migrate.mjs && node dist/standalone/server.js"]
