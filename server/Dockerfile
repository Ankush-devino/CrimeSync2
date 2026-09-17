# bansal
# CrimeSync Backend API Server Dockerfile (Node.js 20 / TypeScript)
# Author: Rajesh Bansal

FROM node:20-alpine AS backend-builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=backend-builder /usr/src/app/dist ./dist

EXPOSE 5000
USER node
CMD ["node", "dist/server.js"]
