# ==========================================
# CateringApp Dockerfile for Production Deployment
# Node.js 20 LTS Alpine for minimal image size
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install build essentials for native packages if needed
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Frontend & Backend bundle
RUN npm run build

# ==========================================
# Production Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create uploads directory for local image storage
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
