# Lista de Tareas: Management Outlook ERP&CRM

## Configuración del Proyecto e Infraestructura
- [x] Inicializar Proyecto Next.js (TypeScript, estructura CSS Estándar)
- [x] Configurar ESLint/Prettier
- [x] Configurar Docker (Dockerfile, docker-compose para App + Base de Datos)
- [x] Definir Estructura de Directorios (División por Módulos/Funcionalidades)

## Diseño de Base de Datos
- [x] Diseñar Esquema para Usuarios y Autenticación (Lista Blanca)
- [x] Diseñar Esquema para CRM (Clientes, Leads, Notas)
- [x] Diseñar Esquema para ERP (Cuentas Bancarias, Transacciones, Activos, Categorías, Adjuntos)
- [x] Diseñar Esquema de Cumplimiento (Años Fiscales, Plazos)
- [x] Seleccionar y Configurar Base de Datos (PostgreSQL recomendado)

## Autenticación y Landing Page
- [x] Implementar Landing Page (Modo Oscuro, Diseño Premium)
- [x] Implementar OAuth con Google (NextAuth.js)
- [x] Implementar Lógica de Lista Blanca de Emails (uhurutradeuk@gmail.com, raul.irus@gmail.com)

## Módulo de Banca e Importación
- [x] Implementar Gestión de Cuentas Bancarias
- [x] Implementar Parsers de CSV (Revolut, Wise, Worldfirst)
- [x] Implementar Almacenamiento y Normalización de Transacciones
- [x] Implementar Lógica de Deduplicación

## Módulo CRM
- [x] Interfaz de Gestión de Clientes/Leads
- [x] Registro de Interacciones (Notas)

## Núcleo ERP y Contabilidad
- [x] Libro Mayor de Transacciones (Filtrado, Categorización)
- [x] Sistema de Carga de Adjuntos (Almacenamiento local o volumen mapeado)
- [/] Lógica de Dividendos y Préstamos a Directores

## Dashboard y Cumplimiento
- [x] Dashboard Financiero (Gráficos, Resúmenes)
- [x] Calendario Fiscal y Seguimiento de Plazos

## Verificación y Preparación para Despliegue
- [x] Verificar Construcción de Docker
- [x] Verificar Persistencia de Datos
- [x] Verificar Adaptabilidad Móvil (Responsive)
