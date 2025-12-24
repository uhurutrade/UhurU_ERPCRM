# 🚀 Deployment Guide - VPS Ubuntu (Contabo)

## 📋 Checklist Pre-Deployment

### ✅ Compatibilidad Verificada

#### Docker & Infraestructura
- ✅ **Dockerfile** optimizado para Alpine Linux
- ✅ **docker-compose.yml** configurado con límites de recursos
- ✅ **pgvector/pgvector:pg15** imagen compatible
- ✅ **.dockerignore** creado para optimizar build
- ✅ **Red externa** `uhuru-network` configurada
- ✅ **Volúmenes persistentes** para DB y uploads

#### Dependencias & Build
- ✅ **Sharp** configurado para Alpine con `vips-dev`
- ✅ **PDF.js** con fallback de canvas deshabilitado
- ✅ **Prisma** con cliente generado en build
- ✅ **Next.js standalone** output habilitado
- ✅ **Node 20 Alpine** como base

#### Base de Datos
- ✅ **Migraciones** aplicables con `prisma migrate deploy`
- ✅ **Seed script** disponible (opcional)
- ✅ **Schema Prisma** compatible con PostgreSQL 15
- ✅ **pgvector** extension ready (comentada en schema)

#### Seguridad
- ✅ **Puertos internos** solo expuestos en red Docker
- ✅ **Usuario sin privilegios** (nextjs:nodejs)
- ✅ **Variables de entorno** desde .env
- ✅ **Logs limitados** (10MB, 3 archivos)

#### Assets & Recursos
- ✅ **invoice-logo.png** presente en public/images
- ✅ **Uploads folder** con permisos correctos
- ✅ **Static assets** copiados al contenedor

---

## 🔧 Pasos de Deployment

### 1. Preparación Local

```bash
# 1. Generar seed actualizado (si quieres sincronizar datos)
npm run generate-seed

# 2. Commit y push de cambios
git add .
git commit -m "Update for VPS deployment"
git push origin main
```

### 2. En el VPS

```bash
# 1. Conectar al VPS
ssh root@your-vps-ip

# 2. Navegar al directorio del proyecto
cd /clients/UhurU/ERPCRM

# 3. Verificar que existe el archivo .env
ls -la .env

# 4. Ejecutar script de deployment
./deploy-vps.sh
```

### 3. Configuración de .env en VPS

Asegúrate de que tu `.env` en el VPS contenga:

```bash
# Database (Docker interno)
DATABASE_URL="postgresql://uhuru_user:uhuru_password@erp-db:5432/uhuru_db?schema=public"
POSTGRES_USER=uhuru_user
POSTGRES_PASSWORD=uhuru_password
POSTGRES_DB=uhuru_db

# Auth (CAMBIAR EN PRODUCCIÓN)
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="genera_un_secret_seguro_aqui"
TRUSTED_HOSTS="https://tu-dominio.com"

# App
NODE_ENV="production"
HOST=0.0.0.0
PORT=3000
NEXT_PUBLIC_CRM_PASSWORD="tu_password_seguro"

# AI (opcional)
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="AIza..."
```

---

## 🔍 Verificación Post-Deployment

### Verificar Contenedores

```bash
docker-compose ps
```

Deberías ver:
- `uhuru-erp-web` (Up)
- `uhuru-erp-db` (Up)

### Verificar Logs

```bash
# Logs de la aplicación
docker-compose logs -f web

# Logs de la base de datos
docker-compose logs -f db
```

### Verificar Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec db psql -U uhuru_user -d uhuru_db

# Dentro de psql:
\dt  # Listar tablas
\q   # Salir
```

### Verificar Aplicación

```bash
# Desde dentro del VPS
curl http://localhost:3000

# O desde tu navegador (si tienes proxy reverso configurado)
https://tu-dominio.com
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Gestión de Base de Datos

```bash
# Backup manual
docker-compose exec db pg_dump -U uhuru_user uhuru_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20251224.sql | docker-compose exec -T db psql -U uhuru_user uhuru_db

# Aplicar migraciones
docker-compose exec web npx prisma migrate deploy

# Ejecutar seed (CUIDADO: borra datos)
docker-compose exec web npx prisma db seed
```

### Mantenimiento

```bash
# Limpiar imágenes no usadas
docker system prune -a

# Ver uso de disco
docker system df

# Limpiar volúmenes huérfanos
docker volume prune
```

---

## 🚨 Troubleshooting

### La aplicación no inicia

```bash
# Ver logs detallados
docker-compose logs web

# Verificar que la DB está lista
docker-compose exec db pg_isready -U uhuru_user

# Reconstruir desde cero
docker-compose down -v
docker-compose up -d --build
```

### Error de migraciones

```bash
# Ver estado de migraciones
docker-compose exec web npx prisma migrate status

# Forzar aplicación de migraciones
docker-compose exec web npx prisma migrate deploy

# Reset completo (CUIDADO: borra datos)
docker-compose exec web npx prisma migrate reset
```

### Error de permisos en uploads

```bash
# Desde el host
docker-compose exec web chown -R nextjs:nodejs /app/public/uploads
```

### Out of Memory

```bash
# Aumentar límites en docker-compose.yml
# Editar:
mem_limit: 2g  # En lugar de 1g
```

---

## 📊 Monitoreo

### Recursos

```bash
# Ver uso de recursos
docker stats

# Ver logs de sistema
journalctl -u docker -f
```

### Backups Automáticos

Considera configurar un cron job para backups automáticos:

```bash
# Editar crontab
crontab -e

# Añadir (backup diario a las 2 AM)
0 2 * * * cd /clients/UhurU/ERPCRM && docker-compose exec -T db pg_dump -U uhuru_user uhuru_db > backups/backup_$(date +\%Y\%m\%d).sql
```

---

## 🔐 Seguridad

### Recomendaciones

1. **Cambiar contraseñas por defecto** en `.env`
2. **Configurar firewall** (UFW) para permitir solo puertos necesarios
3. **Usar HTTPS** con certificado SSL (Let's Encrypt)
4. **Configurar proxy reverso** (Nginx/Caddy)
5. **Actualizar regularmente** dependencias y sistema

### Firewall Básico

```bash
# Habilitar UFW
ufw enable

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP/HTTPS (si usas proxy reverso)
ufw allow 80/tcp
ufw allow 443/tcp

# Ver estado
ufw status
```

---

## 📝 Notas Importantes

1. **No ejecutar seed en producción** a menos que sepas lo que haces (borra datos)
2. **Hacer backups antes de migraciones** importantes
3. **Verificar logs** después de cada deployment
4. **Mantener .env seguro** y nunca commitear a Git
5. **Monitorear recursos** del VPS regularmente

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Consulta esta guía de troubleshooting
4. Revisa las migraciones: `docker-compose exec web npx prisma migrate status`

---

**Última actualización:** 2025-12-24
**Versión:** 1.0.0
