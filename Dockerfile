# ----------------------------------------------------
# 1. Etapa BASE: Define el entorno de Alpine y dependencias de sistema
# ----------------------------------------------------
FROM node:20-alpine AS base

# CORRECCIÓN CLAVE: Instalar OpenSSL para compatibilidad con Prisma
RUN apk add --no-cache libc6-compat openssl libstdc++

# ----------------------------------------------------
# 2. Etapa de Dependencias (Deps Stage)
# ----------------------------------------------------
FROM base AS deps
WORKDIR /app

ENV NODE_ENV production
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar las dependencias de producción
RUN npm ci --only=production

# ----------------------------------------------------
# 3. Etapa de Construcción (Builder Stage)
# ----------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copiamos TODOS los archivos de código fuente
COPY . .
# Copiamos las dependencias de la etapa 'deps'
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Generar el cliente Prisma
RUN npx prisma generate

# Deshabilitar la telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Ejecutamos el build.
RUN npm run build

# ----------------------------------------------------
# 4. Etapa de Producción (Runner Stage)
# ----------------------------------------------------
FROM base AS runner

# Configuración del usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
EXPOSE 3000
ENV PORT 3000

# ❌ LÍNEA ELIMINADA:
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 1. Copia el standalone
# La estructura de standalone copia el servidor y archivos esenciales.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 2. Copia los estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Crear el directorio de uploads y configurar permisos
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

CMD ["node", "server.js"]
