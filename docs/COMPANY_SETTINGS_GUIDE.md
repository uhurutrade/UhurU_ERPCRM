# Company Settings - Guía de Uso

## Descripción General

La sección **Company Settings** te permite registrar toda la información legal de tu empresa según los requisitos de **Companies House** y **HMRC** del Reino Unido. Esta información se utiliza para:

1. Calcular automáticamente las fechas de vencimiento de obligaciones fiscales
2. Generar recordatorios de cumplimiento
3. Mantener un registro centralizado de información corporativa
4. Facilitar la presentación de cuentas y declaraciones

## Secciones del Formulario

### 1. Basic Company Information (Información Básica de la Empresa)
- **Company Name**: Nombre legal de la empresa
- **Company Number**: Número de registro en Companies House (8 dígitos)
- **Incorporation Date**: Fecha de constitución de la empresa
- **Company Type**: Tipo de empresa (Ltd, PLC, LLP, etc.)
- **SIC Codes**: Códigos de clasificación industrial estándar (separados por comas)

### 2. Registered Office Address (Dirección Registrada)
Dirección oficial registrada en Companies House. **Obligatorio por ley**.

### 3. Trading Address (Dirección Comercial)
Si tu empresa opera desde una dirección diferente a la registrada, completa esta sección.

### 4. Financial Year & Deadlines (Año Fiscal y Fechas Límite)

#### Financial Year End
Formato: `DD-MM` (ejemplo: `31-03` para 31 de marzo)

#### Accounts Next Due Date
Fecha límite para presentar las cuentas anuales en Companies House.
- **Empresas nuevas**: 21 meses después de la constitución
- **Empresas existentes**: 9 meses después del fin del año fiscal

#### Confirmation Statement Next Due
Fecha límite para presentar la declaración de confirmación anual.
- Se presenta una vez al año
- Debe presentarse dentro de los 14 días posteriores al aniversario de constitución

### 5. VAT Information (Información de IVA)

#### VAT Registered
Marca esta casilla si tu empresa está registrada para IVA.

**Obligatorio registrarse si**:
- Facturación superior a £90,000 en los últimos 12 meses
- Esperas superar £90,000 en los próximos 30 días

#### VAT Number
Formato: `GB123456789`

#### VAT Scheme (Esquema de IVA)
- **Standard**: Esquema estándar (20% en la mayoría de bienes/servicios)
- **Flat Rate**: Tarifa plana (porcentaje fijo según sector)
- **Cash Accounting**: Contabilidad de caja
- **Annual Accounting**: Contabilidad anual

#### VAT Return Frequency (Frecuencia de Declaración)
- **Quarterly**: Trimestral (más común)
- **Monthly**: Mensual (para grandes empresas)
- **Annual**: Anual (solo con esquema de contabilidad anual)

**Fechas de presentación trimestral**:
- Q1: 31 marzo → Presentar antes del 7 mayo
- Q2: 30 junio → Presentar antes del 7 agosto
- Q3: 30 septiembre → Presentar antes del 7 noviembre
- Q4: 31 diciembre → Presentar antes del 7 febrero

### 6. HMRC Information (Información de HMRC)

#### UTR (Unique Taxpayer Reference)
Referencia única de contribuyente de 10 dígitos. Se recibe al registrar la empresa para Corporation Tax.

#### Corporation Tax Reference
Referencia específica para el impuesto de sociedades.

**Fechas importantes**:
- Pago: 9 meses y 1 día después del fin del año fiscal
- Declaración: 12 meses después del fin del año fiscal

#### PAYE Reference
Solo si tienes empleados. Referencia del sistema Pay As You Earn.

### 7. Directors & Officers (Directores y Funcionarios)

#### Directors
Puedes listar los directores separados por comas o en formato JSON:
```
John Smith, Jane Doe
```

#### Company Secretary
Secretario de la empresa (opcional para empresas privadas desde 2008).

### 8. Share Capital (Capital Social)

#### Share Capital
Valor total del capital social en libras esterlinas.

#### Number of Shares
Número total de acciones emitidas.

**Ejemplo común**:
- Share Capital: £100
- Number of Shares: 100
- Valor por acción: £1

### 9. Accounting Software & Methods

#### Accounting Software
- Xero
- QuickBooks
- Sage
- FreeAgent
- Manual
- Other

#### Accounting Method
- **Cash Basis**: Registras ingresos/gastos cuando se pagan (para pequeñas empresas)
- **Accrual Basis**: Registras cuando se factura/recibe factura (más común)

### 10. Contact Information
Información de contacto de la empresa para uso interno.

## Compliance Overview (Resumen de Cumplimiento)

Una vez que completes la configuración, verás un panel en la parte superior que muestra:

### Indicadores de Estado
- 🟢 **OK**: Más de 30 días hasta la fecha límite
- 🟡 **URGENT**: Menos de 30 días (o 14 para confirmation statement)
- 🔴 **OVERDUE**: Fecha límite pasada

### Obligaciones Calculadas Automáticamente

1. **Annual Accounts Filing** (Companies House)
   - Basado en: `accountsNextDueDate`
   - Urgente: < 30 días

2. **Confirmation Statement** (Companies House)
   - Basado en: `confirmationNextDueDate`
   - Urgente: < 14 días

3. **VAT Return** (HMRC)
   - Calculado automáticamente según `vatReturnFrequency`
   - Urgente: < 7 días

4. **Corporation Tax Payment** (HMRC)
   - Calculado: 9 meses + 1 día después de `financialYearEnd`
   - Urgente: < 30 días

## Consejos y Mejores Prácticas

### 1. Mantén la Información Actualizada
- Revisa y actualiza los datos trimestralmente
- Actualiza las fechas límite después de cada presentación

### 2. Fechas Importantes a Recordar
- **Companies House**: Multas por presentación tardía de cuentas (£150-£1,500)
- **HMRC VAT**: Multa del 15% si pagas tarde
- **Corporation Tax**: Intereses y multas por pago tardío

### 3. Documentación a Tener a Mano
- Certificate of Incorporation
- Últimas cuentas presentadas
- Últimas declaraciones de IVA
- Registros de directores y accionistas

### 4. Integración con Otras Secciones
La información de Company Settings se utiliza en:
- **Compliance**: Generación automática de recordatorios
- **ERP**: Configuración de impuestos en facturas
- **Banking**: Categorización de transacciones fiscales

## Recursos Útiles

- **Companies House**: https://www.gov.uk/government/organisations/companies-house
- **HMRC VAT**: https://www.gov.uk/vat-registration
- **Corporation Tax**: https://www.gov.uk/corporation-tax
- **Confirmation Statement**: https://www.gov.uk/file-your-confirmation-statement-with-companies-house

## Soporte

Si necesitas ayuda para completar algún campo:
1. Consulta tu Certificate of Incorporation
2. Revisa tus últimas presentaciones en Companies House
3. Contacta con tu contador o asesor fiscal
4. Visita los enlaces de recursos oficiales arriba mencionados
