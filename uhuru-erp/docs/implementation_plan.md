# Plan de Implementación - Management Outlook ERP&CRM

Este plan describe el desarrollo del ERP y CRM web para Uhuru Trade Ltd.

## Selección de Tecnología
Para cumplir con los requisitos de una aplicación moderna, "full-stack", "responsive" y dockerizable, preparada para futuras apps móviles, propongo:

*   **Framework**: **Next.js 14+ (App Router)**. Maneja tanto el Frontend (React) como el Backend (API) sin problemas. Es robusto, estándar en la industria y permite crear APIs fácilmente para las futuras apps móviles.
*   **Lenguaje**: **TypeScript**. Para seguridad de tipos en cálculos financieros.
*   **Base de Datos**: **PostgreSQL** (vía Docker). Una base de datos relacional es crucial para la integridad contable.
*   **ORM**: **Prisma**. Para acceso seguro a la base de datos y gestión de migraciones.
*   **Estilos**: **CSS Modules** con un Sistema de Diseño personalizado para el "Modo Oscuro Premium".
*   **Autenticación**: **NextAuth.js** (Auth.js) v5. Integración específica con Google y lista blanca estricta de emails.
*   **Contenedores**: **Docker & Docker Compose**.

## Revisión del Usuario Requerida
> [!IMPORTANT]
> **Almacenamiento**: Los documentos subidos (PDFs, Imágenes) se guardarán inicialmente en un volumen local de Docker mapeado al disco del VPS. Esto asegura que tengas control total como solicitaste.
> **Lista Blanca**: Solo se permitirá el acceso a `raul.irus@gmail.com` y `uhurutradeuk@gmail.com`.

## Arquitectura Propuesta

### 1. Esquema de Base de Datos (Preliminar)
*   **User (Usuario)**: email, nombre, rol (estrictamente limitado a los 2 emails).
*   **CompanyEntity**: Para permitir futura multi-empresa, aunque inicialmente sea solo Uhuru Trade Ltd.
*   **CRM (Consultora ~5 empleados)**:
    *   `Organization` (Cuenta): Empresas clientes o prospectos. (Nombre, Sector, Web, Dirección).
    *   `Contact`: Personas de contacto. (Nombre, Email, Teléfono, Cargo, vinculado a Organization).
    *   `Lead`: Prospectos iniciales sin cualificar. (Estado: Nuevo, Contactado, Cualificado, Descartado).
    *   `Deal` (Oportunidad): Negocios en curso. (Título, Monto Estimado, Etapa: Prospección, Propuesta, Negociación, Cerrado Ganado/Perdido, Fecha Cierre).
    *   `Activity`: Registro de llamadas, emails, reuniones.
    *   `Task`: Recordatorios y tareas asignadas a empleados (ej. "Enviar propuesta el martes").
*   **ERP**:
    *   `BankAccount`: Banco (Wise, Revolut, etc), Moneda (GBP, USD, EUR), IBAN/Número.
    *   `Transaction`: Fecha, Descripción, Monto, Moneda, TasaCambio, Comisión, Estado, Categoría, Referencia, Hash (para deduplicación).
    *   `Attachment`: ruta, tipo, Transacción vinculada.
    *   `Asset (Activo)`: Nombre, FechaCompra, Valor, CalendarioAmortización.
    *   `DirectorLoan`: Principal, Repagos, Interés.

### 2. Módulos

#### [Configuración Principal]
*   Inicializar app Next.js.
*   Configurar PostgreSQL en Docker Compose.
*   Configurar esquema Prisma.

#### [Autenticación y Landing]
*   **Landing Page**: Estética oscura, Logo, "Login with Google".
*   **Protección**: Middleware para bloquear todas las rutas `/dashboard/*` a menos que esté autenticado vía lista blanca.

#### [Motor de Importación Bancaria]
*   **Parsers**: Lógica específica para leer las cabeceras CSV proporcionadas (Revolut, Wise, Worldfirst).
*   **Normalización**: Convertir todo a un objeto estándar `Transaction`.
*   **Deduplicación**: Verificar `Transaction ID` (del banco) o generar un hash compuesto (Fecha + Monto + Descripción) para evitar duplicados al resubir.

#### [Funcionalidades]
*   **CRM Completo**:
    *   **Pipeline de Ventas**: Tablero Kanban para visualizar Oportunidades por etapa.
    *   **Gestión de Cuentas**: Vista 360 de cada cliente (contactos, oportunidades abiertas, historial de actividades).
    *   **Gestión de Tareas**: Lista de pendientes para el equipo.
*   **Vista Contable**: Tabla libro mayor con filtros (Banco, Fecha, Categoría).
*   **Dashboard**: Gráficos financieros.

## Plan de Verificación

### Pruebas Automatizadas
*   **Parsing CSV**: Tests unitarios para asegurar que las filas de ejemplo de CSV se leen correctamente.
*   **Tests API**: Pruebas de conexión a la base de datos.

### Verificación Manual
*   **Docker**: Asegurar que `docker-compose up` levanta la db y la app correctamente.
*   **Auth**: Probar login con un email no autorizado (debe fallar) y uno autorizado (debe funcionar).
*   **Importación**: Subir archivos CSV de prueba y verificar que los datos aparecen en la tabla.
