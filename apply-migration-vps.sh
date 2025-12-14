#!/bin/bash
# Script para aplicar la migración en el VPS
# Ejecutar desde: /clients/UhurU/ERPCRM

echo "🔄 Aplicando migración de base de datos..."

# 1. Aplicar la migración
docker-compose exec web npx prisma migrate deploy

# 2. Reiniciar la aplicación para que tome los cambios
echo "🔄 Reiniciando la aplicación..."
docker-compose restart web

# 3. Verificar logs
echo "📋 Verificando logs..."
docker-compose logs --tail=50 web

echo "✅ Proceso completado. Verifica que no haya errores arriba."
