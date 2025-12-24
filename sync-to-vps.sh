#!/bin/bash
# ============================================
# Script de Sincronización y Deploy VPS
# ============================================
# Este script actualiza el código en el VPS y redeploya la aplicación
# Ejecutar desde tu máquina local

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuración VPS
VPS_USER="root"
VPS_HOST="vmi2681340"
VPS_PATH="/clients/UhurU/ERPCRM"

echo -e "${GREEN}🚀 Iniciando sincronización con VPS...${NC}"

# 1. Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERROR: Este script debe ejecutarse desde la raíz del proyecto${NC}"
    exit 1
fi

# 2. Asegurar que todos los cambios están commiteados
echo -e "${YELLOW}📝 Verificando git status...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Tienes cambios sin commitear. Por favor, commitea o stashea tus cambios.${NC}"
    git status -s
    read -p "¿Deseas continuar de todas formas? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. Hacer push a Git (si hay commits)
echo -e "${YELLOW}📤 Haciendo push a Git...${NC}"
git push origin main || echo -e "${YELLOW}⚠️  No se pudo hacer push (puede que ya esté actualizado)${NC}"

# 4. Sincronizar archivos críticos al VPS
echo -e "${YELLOW}📦 Sincronizando archivos al VPS...${NC}"

# Crear lista de exclusiones
RSYNC_EXCLUDES=(
    --exclude='.git'
    --exclude='node_modules'
    --exclude='.next'
    --exclude='uploads'
    --exclude='.env'
    --exclude='*.log'
    --exclude='.vscode'
    --exclude='backups'
)

# Sincronizar código (excluye .env para no sobrescribir el del VPS)
rsync -avz --progress "${RSYNC_EXCLUDES[@]}" \
    ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

echo -e "${GREEN}✅ Archivos sincronizados${NC}"

# 5. Ejecutar deploy en el VPS
echo -e "${YELLOW}🔄 Ejecutando deploy en el VPS...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /clients/UhurU/ERPCRM

echo "🚀 Iniciando deployment..."

# 1. Limpieza profunda de red Docker (Fix para 'endpoint already exists')
echo "🧹 Limpiando red Docker..."
docker-compose down || true
docker network disconnect -f uhuru-network uhuru-erp-web 2>/dev/null || true

# 2. Actualizar desde Git (si es un repo)
if [ -d ".git" ]; then
    echo "📥 Actualizando desde Git..."
    git pull origin main || echo "⚠️  No se pudo actualizar desde Git"
fi

# 3. Build and start
echo "🔨 Construyendo y levantando contenedores..."
docker-compose up -d --build

# 4. Esperar a DB y Aplicar Migraciones
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

echo "🔄 Aplicando migraciones Prisma..."
docker-compose exec -T web npx prisma migrate deploy

# 5. Ejecutar Seed para sincronizar datos
echo "🌱 Sincronizando datos (Seeding)..."
docker-compose exec -T web npx prisma db seed

# 6. Vectorización (RAG)
echo "🤖 Ejecutando vectorización de datos del sistema..."
docker-compose exec -T web npx tsx scripts/vectorize-system-data.ts || true

echo "✅ Deploy completado"

# Show logs
echo "📋 Últimos logs:"
docker-compose logs --tail=50 web
ENDSSH

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Sincronización y deploy completados${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📝 Comandos útiles:"
echo -e "  Ver logs: ${YELLOW}ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_PATH} && docker-compose logs -f web'${NC}"
echo -e "  Estado: ${YELLOW}ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_PATH} && docker-compose ps'${NC}"
echo ""
