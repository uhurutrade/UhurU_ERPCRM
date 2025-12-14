#!/bin/bash
echo "🚀 Iniciando actualización del sistema..."

# 1. Bajar últimos cambios (código y datos)
echo "📥 Descargando cambios desde GitHub..."
git pull

# 2. Reconstruir contenedores (por si hay cambios en dependencias)
echo "🏗️ Reconstruyendo contenedores..."
docker compose down
docker compose up -d --build

# 3. Esperar un momento a que la base de datos arranque
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# 4. Aplicar migraciones de estructura
echo "🛠️ Aplicando migraciones de base de datos..."
docker compose exec web npx prisma migrate deploy

# 5. Sincronizar datos (Seed)
# Esto borrará los datos viejos del VPS y pondrás los nuevos del local que acabas de bajar
echo "🌱 Sincronizando datos (Reset & Seed)..."
docker compose exec web npx prisma db seed

echo "✅ ¡Actualización completada exitosamente!"
