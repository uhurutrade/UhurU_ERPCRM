#!/bin/bash

# ==============================================================================
# UhurU ERP CRM - Sync & Deploy Script (Modo Seguro: Sin pérdida de datos)
# ==============================================================================

REPO_DIR="/clients/UhurU/ERPCRM"

echo "📂 Entrando al directorio del repositorio..."
cd "$REPO_DIR" || { echo "❌ No se encontró $REPO_DIR"; exit 1; }

# 1. Verificación de repositorio
if [ ! -d ".git" ]; then
    echo "🚀 Repositorio no existe, clonando desde GitHub..."
    cd ..
    rm -rf ERPCRM
    git clone https://github.com/uhurutrade/UhurU_ERPCRM.git ERPCRM || { echo "❌ Error al clonar"; exit 1; }
    cd ERPCRM
fi

# 2. Gestión de cambios locales para evitar conflictos en el pull
if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Hay cambios locales, se guardarán temporalmente en stash..."
    git stash
fi

# 3. Actualizar código (Esto bajará el nuevo Seed seguro y la configuración de tsx)
echo "⬇️ Descargando última versión desde GitHub..."
git pull origin main || { echo "❌ Error al hacer git pull"; exit 1; }

# 4. Docker: Reinicio y limpieza
echo "🐳 Deteniendo contenedores antiguos..."
docker compose down

echo "🧹 Limpiando imagen antigua para asegurar nuevas dependencias (tsx)..."
docker image rm erpcrm-web || true

echo "♻️ Restaurando archivos de configuración originales del VPS..."
cp env.original .env || echo "⚠️ Sin env.original, usando .env actual"
cp docker-compose.yml.original docker-compose.yml || echo "⚠️ Sin docker-compose.original, usando actual"

# 5. Construcción y despliegue
echo "🔨 Construyendo nueva imagen Docker..."
docker compose build --no-cache

echo "🚀 Levantando servicios..."
docker compose up -d --build
sleep 8

# 6. Red y Base de Datos (Sincronización de esquema)
echo "🌐 Asegurando conexión a la red uhuru-network..."
docker network connect uhuru-network uhuru-erp-web || true

echo "🛠 Aplicando cambios de esquema..."
# Primero intentamos migraciones normales
docker compose exec -T web npx prisma migrate deploy || echo "⚠️ No hay migraciones nuevas, intentando push directo..."

# FORZAMOS la sincronización para añadir columnas nuevas (como paymentDetails)
echo "⚡ Forzando sincronización de esquema (db push)..."
docker compose exec -T web npx prisma db push --accept-data-loss

# 7. Sincronización de datos SEGURA
# Nota: Gracias al cambio a 'upsert', este comando NO borrará tus datos consolidados en el VPS.
echo "🌱 Sincronizando datos CRM y Sistema (Modo Incremental)..."
docker compose exec -T web npx prisma db seed

echo "✅ Update y deploy completado."

# 8. Mantenimiento y RAG
echo "📄 Re-procesando documentos..."
docker exec uhuru-erp-web npm run reprocess-documents

echo "🤖 Vectorizando datos del sistema..."
docker exec uhuru-erp-web npm run vectorize-system

# 9. OPCIONAL: Punto de Restauración (Backup por Seed)
echo ""
echo "❓ ¿Deseas generar un PUNTO DE RESTAURACIÓN (Backup Total) con los datos actuales del VPS?"
read -p "(s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]
then
    echo "💾 Generando Seed de restauración completa..."
    docker exec -e FULL_EXPORT=true uhuru-erp-web npm run generate-seed
    echo "✅ Punto de restauración guardado en prisma/seed.ts"
else
    echo "⏩ Saltando backup total. Manteniendo modo seguro."
fi

echo "🌟 ¡Todo listo y actualizado!"
