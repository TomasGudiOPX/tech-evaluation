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
RUN yarn workspace @vps-template/api build
RUN yarn workspaces focus @vps-template/api --production

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist

USER node
EXPOSE 3000

WORKDIR /app/apps/api

CMD ["node", "dist/server.js"]
