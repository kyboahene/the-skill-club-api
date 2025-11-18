FROM node:20-bullseye-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN npm i -g npm@11.6.2
COPY . .

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate

RUN npm run build
RUN npm prune --production

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -sf http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]
