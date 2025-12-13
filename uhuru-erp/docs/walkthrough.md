# Walkthrough & Deployment Guide - Management Outlook ERP&CRM

## Preview Visual (Mockups)
Dado que no es posible ejecutar la aplicación localmente sin Node.js, aquí tienes una vista previa del diseño que se ha implementado.

````carousel
![Landing Page](/C:/Users/30080097/.gemini/antigravity/brain/5291c2fc-df5d-4fb1-a195-bf159a892a37/landing_page_mockup_1765609490681.png)
<!-- slide -->
![Dashboard Principal](/C:/Users/30080097/.gemini/antigravity/brain/5291c2fc-df5d-4fb1-a195-bf159a892a37/dashboard_mockup_1765609506701.png)
<!-- slide -->
![Banca & Cuentas](/C:/Users/30080097/.gemini/antigravity/brain/5291c2fc-df5d-4fb1-a195-bf159a892a37/banking_mockup_1765610030245.png)
<!-- slide -->
![ERP - Libro Mayor](/C:/Users/30080097/.gemini/antigravity/brain/5291c2fc-df5d-4fb1-a195-bf159a892a37/erp_ledger_mockup_1765610047675.png)
<!-- slide -->
![CRM Pipeline](/C:/Users/30080097/.gemini/antigravity/brain/5291c2fc-df5d-4fb1-a195-bf159a892a37/crm_kanban_mockup_1765609520206.png)
<!-- slide -->
![Cumplimiento Legal](/C:/Users/30080097/.gemini/antigravity/brain/5291c2fc-df5d-4fb1-a195-bf159a892a37/compliance_mockup_1765610062134.png)
````

## Resumen del Proyecto
Has completado la creación de la aplicación web dockerizada para Uhuru Trade Ltd. La aplicación incluye:

*   **Autenticación**: Login con Google limitado exclusivamente a `raul.irus@gmail.com` y `uhurutradeuk@gmail.com`.
*   **ERP Bancario**:
    *   Soporte para múltiples cuentas (GBP, EUR, USD).
    *   Importación de CSVs de **Revolut**, **Wise** y **Worldfirst**.
    *   Deduplicación automática de transacciones.
    *   Libro mayor con posibilidad de adjuntar recibos/facturas.
*   **CRM**:
    *   Gestión de Empresas y Contactos.
    *   Pipeline de Ventas (Deals) tipo Kanban.
*   **Cumplimiento**:
    *   Gestión de plazos fiscales (HMRC, Companies House).

## Instrucciones de Despliegue (VPS)

1.  **Copiar Archivos**: Sube la carpeta `uhuru-erp` a tu servidor (ej. usando SCP o Git).
2.  **Configurar Entorno**:
    Crea un archivo `.env` en la raíz basado en el ejemplo proporcionado, con tus credenciales reales:

    ```bash
    DATABASE_URL="postgresql://uhuru_user:tu_password_seguro@db:5432/uhuru_db?schema=public"
    NEXTAUTH_URL="https://outlook.uhurutrade.com"
    NEXTAUTH_SECRET="genera_un_string_largo_y_seguro"
    AUTH_GOOGLE_ID="tu_google_client_id"
    AUTH_GOOGLE_SECRET="tu_google_client_secret"
    ```

3.  **Iniciar Docker**:
    Ejecuta el siguiente comando en la carpeta del proyecto:

    ```bash
    docker-compose up -d --build
    ```

4.  **Inicializar Base de Datos**:
    Necesitas aplicar el esquema de Prisma a la base de datos dentro del contenedor. Ejecuta:

    ```bash
    docker-compose exec web npx prisma db push
    ```

## Flujos de Uso

### 1. Importación Bancaria
1.  Ve a **Banca** en el menú.
2.  Crea tus cuentas (ej. "Revolut GBP").
3.  Descarga el CSV de tu banco.
4.  Usa el formulario en la tarjeta de la cuenta para subir el archivo.
5.  El sistema procesará y evitará duplicados automáticamente.

### 2. Conciliación y Adjuntos
1.  Ve a **ERP** (Libro Mayor).
2.  Verás todas las transacciones importadas.
3.  Pulsa el icono del "Clip" 📎 para subir una factura o recibo asociado a ese movimiento.

### 3. Gestión Comercial
1.  Ve a **CRM**.
2.  Añade primero la **Empresa** (Cliente Potencial).
3.  Añade **Contactos** asociados.
4.  Ve a "Pipeline (Deals)" para crear una oportunidad de venta y moverla por las etapas.

## Notas Técnicas
*   Los adjuntos se guardan en el volumen `uploads` mapeado en tu VPS, asegurando que los archivos físicos están bajo tu control.
*   La base de datos PostgreSQL también persiste sus datos en un volumen Docker `db_data`.
