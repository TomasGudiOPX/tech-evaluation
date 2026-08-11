FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
RUN yarn install --immutable

COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts
RUN yarn workspace @vps-template/contracts build
RUN yarn workspace @vps-template/api prisma:generate
RUN yarn workspace @vps-template/api build

FROM build AS api-tools

WORKDIR /app/apps/api

CMD ["yarn", "workspace", "@vps-template/api", "prisma", "migrate", "deploy"]

FROM build AS production-deps

RUN yarn workspaces focus @vps-template/api --production

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/apps/api/package.json ./apps/api/package.json
COPY --from=production-deps /app/apps/api/dist ./apps/api/dist
COPY --from=production-deps /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=production-deps /app/packages/contracts/dist ./packages/contracts/dist

USER node
EXPOSE 3000

WORKDIR /app/apps/api

CMD ["node", "dist/server.js"]
