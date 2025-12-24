#!/bin/bash
# ============================================
# Script de Deployment para VPS Ubuntu (Contabo)
# ============================================
# Este script debe ejecutarse en el VPS, no en local
# Ubicación recomendada: /clients/UhurU/ERPCRM

set -e  # Exit on error

echo "🚀 Iniciando deployment de Uhuru ERP CRM..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# 1. Pre-checks
# ============================================
echo -e "${YELLOW}📋 Verificando requisitos...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ ERROR: Archivo .env no encontrado${NC}"
    echo "Por favor, crea el archivo .env con las variables necesarias"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ ERROR: Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ ERROR: Docker Compose no está instalado${NC}"
    exit 1
fi

# ============================================
# 2. Crear red externa si no existe
# ============================================
echo -e "${YELLOW}🌐 Verificando red Docker...${NC}"
if ! docker network inspect uhuru-network &> /dev/null; then
    echo "Creando red uhuru-network..."
    docker network create uhuru-network
else
    echo "Red uhuru-network ya existe ✓"
fi

# ============================================
# 3. Backup de la base de datos (si existe)
# ============================================
if docker ps -a | grep -q uhuru-erp-db; then
    echo -e "${YELLOW}💾 Creando backup de la base de datos...${NC}"
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T db pg_dump -U uhuru_user uhuru_db > "$BACKUP_FILE" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  No se pudo crear backup (la DB puede no existir aún)${NC}"
    }
    
    if [ -f "$BACKUP_FILE" ]; then
        echo -e "${GREEN}✓ Backup guardado en: $BACKUP_FILE${NC}"
        # Mantener solo los últimos 5 backups
        ls -t $BACKUP_DIR/backup_*.sql | tail -n +6 | xargs -r rm
    fi
fi

# ============================================
# 4. Pull de la última versión del código
# ============================================
echo -e "${YELLOW}📥 Actualizando código desde Git...${NC}"
if [ -d ".git" ]; then
    git pull origin main || {
        echo -e "${YELLOW}⚠️  No se pudo hacer git pull. Continuando...${NC}"
    }
else
    echo -e "${YELLOW}⚠️  No es un repositorio Git. Asegúrate de tener el código actualizado.${NC}"
fi

# ============================================
# 5. Detener contenedores existentes
# ============================================
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
docker-compose down || true

# ============================================
# 6. Construir imágenes
# ============================================
echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose build --no-cache

# ============================================
# 7. Iniciar servicios
# ============================================
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose up -d

# ============================================
# 8. Esperar a que la base de datos esté lista
# ============================================
echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
sleep 10

# Verificar que la DB está lista
MAX_RETRIES=30
RETRY_COUNT=0
until docker-compose exec -T db pg_isready -U uhuru_user &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}❌ ERROR: PostgreSQL no está respondiendo${NC}"
        docker-compose logs db
        exit 1
    fi
    echo "Esperando PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo -e "${GREEN}✓ PostgreSQL está listo${NC}"

# ============================================
# 9. Aplicar migraciones
# ============================================
echo -e "${YELLOW}🔄 Aplicando migraciones de base de datos...${NC}"
docker-compose exec -T web npx prisma migrate deploy || {
    echo -e "${RED}❌ ERROR: Falló la aplicación de migraciones${NC}"
    docker-compose logs web
    exit 1
}

echo -e "${GREEN}✓ Migraciones aplicadas correctamente${NC}"

# ============================================
# 10. Generar cliente Prisma (por si acaso)
# ============================================
echo -e "${YELLOW}🔧 Generando cliente Prisma...${NC}"
docker-compose exec -T web npx prisma generate || {
    echo -e "${YELLOW}⚠️  No se pudo generar el cliente Prisma (puede que ya esté generado)${NC}"
}

# ============================================
# 11. Seed de datos (OPCIONAL - comentado por defecto)
# ============================================
# DESCOMENTAR SOLO SI QUIERES POBLAR LA DB CON DATOS DE SEED
# echo -e "${YELLOW}🌱 Ejecutando seed de datos...${NC}"
# docker-compose exec -T web npx prisma db seed

# ============================================
# 12. Verificar estado de los contenedores
# ============================================
echo -e "${YELLOW}📊 Verificando estado de los contenedores...${NC}"
docker-compose ps

# ============================================
# 13. Mostrar logs recientes
# ============================================
echo -e "${YELLOW}📋 Logs recientes de la aplicación:${NC}"
docker-compose logs --tail=50 web

# ============================================
# 14. Health check
# ============================================
echo -e "${YELLOW}🏥 Verificando salud de la aplicación...${NC}"
sleep 5

if docker-compose exec -T web wget -q --spider http://localhost:3000 2>/dev/null; then
    echo -e "${GREEN}✅ La aplicación está respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  La aplicación puede tardar unos segundos más en estar lista${NC}"
fi

# ============================================
# Finalización
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment completado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📝 Próximos pasos:"
echo -e "  1. Verifica que la aplicación funcione correctamente"
echo -e "  2. Revisa los logs: ${YELLOW}docker-compose logs -f web${NC}"
echo -e "  3. Accede a la aplicación a través de tu proxy reverso"
echo ""
echo -e "🔧 Comandos útiles:"
echo -e "  - Ver logs en tiempo real: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  - Reiniciar servicios: ${YELLOW}docker-compose restart${NC}"
echo -e "  - Detener servicios: ${YELLOW}docker-compose down${NC}"
echo -e "  - Ver estado: ${YELLOW}docker-compose ps${NC}"
echo ""
