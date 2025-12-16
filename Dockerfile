# ----------------------------------------------------
# 1. Etapa BASE: Define el entorno de Alpine y dependencias de sistema
# ----------------------------------------------------
FROM node:20-alpine AS base

# Instalar dependencias necesarias para Prisma y OpenSSL
RUN apk add --no-cache libc6-compat openssl libstdc++

# ----------------------------------------------------
# 2. Etapa de Dependencias (Deps Stage)
# ----------------------------------------------------
FROM base AS deps
WORKDIR /app

ENV NODE_ENV production
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias de producción (sin Husky)
ENV HUSKY=0
RUN npm ci --only=production --legacy-peer-deps

# ----------------------------------------------------
# 3. Etapa de Construcción (Builder Stage)
# ----------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copiamos TODO el código fuente
COPY . .

# Instalar TODAS las dependencias (incluyendo dev) para tener Prisma CLI
ENV HUSKY=0
RUN npm ci --legacy-peer-deps

# Generar el cliente Prisma
RUN ./node_modules/.bin/prisma generate

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Build de Next.js
RUN npm run build

# ----------------------------------------------------
# 4. Etapa de Producción (Runner Stage)
# ----------------------------------------------------
FROM base AS runner

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
EXPOSE 3000
ENV PORT 3000

# Copiar Next.js standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar node_modules de producción (incluye Prisma client)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copiar Prisma schema
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copiar cliente Prisma generado
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Crear carpeta de uploads
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
CMD ["node", "server.js"]
