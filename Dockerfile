FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci && npm cache clean --force
RUN apk add --no-cache curl

COPY . .

RUN npx prisma generate

RUN npm run build
RUN npm prune --production

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -sf http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]
