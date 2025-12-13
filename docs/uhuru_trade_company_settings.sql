-- Script SQL para insertar los datos de UHURU TRADE LTD
-- Basado en la información de Companies House: https://find-and-update.company-information.service.gov.uk/company/15883242

-- NOTA: Este script es para referencia. Para insertar los datos, usa el formulario web o ejecuta este SQL directamente.

INSERT INTO "CompanySettings" (
    id,
    -- Basic Company Information
    "companyName",
    "companyNumber",
    "incorporationDate",
    "companyType",
    "sicCodes",
    
    -- Registered Office Address (deberás completar con tu dirección real)
    "registeredAddress",
    "registeredCity",
    "registeredPostcode",
    "registeredCountry",
    
    -- Financial Year
    "financialYearEnd",
    "accountsNextDueDate",
    "confirmationNextDueDate",
    
    -- Tax Information (completar según tu situación)
    "vatRegistered",
    "vatNumber",
    "vatRegistrationDate",
    "vatScheme",
    "vatReturnFrequency",
    
    -- HMRC Information (completar según tu situación)
    "utr",
    "corporationTaxReference",
    "payeReference",
    
    -- Directors & Officers
    "directors",
    
    -- Share Capital
    "shareCapital",
    "numberOfShares",
    
    -- Contact Information (completar con tus datos)
    "contactEmail",
    "contactPhone",
    "website",
    
    -- Timestamps
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(), -- id generado automáticamente
    
    -- Basic Company Information
    'UHURU TRADE LTD',
    '15883242',
    '2024-08-07', -- Incorporation date from filing history
    'Ltd', -- Private Limited Company
    '47910, 62012, 62020, 70229', -- SIC codes from Companies House
    
    -- Registered Office Address
    -- NOTA: Debes completar con tu dirección registrada real
    'TU DIRECCIÓN REGISTRADA',
    'TU CIUDAD',
    'TU CÓDIGO POSTAL',
    'United Kingdom',
    
    -- Financial Year
    '31-08', -- Financial year end: 31 August
    '2027-05-31', -- Next accounts due: 31 May 2027
    '2026-08-09', -- Next confirmation statement due: 9 August 2026
    
    -- Tax Information
    -- NOTA: Actualiza según tu situación de VAT
    false, -- Cambia a true si estás registrado para VAT
    NULL, -- Añade tu VAT number si aplica (ej: 'GB123456789')
    NULL, -- Añade tu VAT registration date si aplica
    NULL, -- Añade tu VAT scheme si aplica (ej: 'Standard')
    NULL, -- Añade tu VAT frequency si aplica (ej: 'Quarterly')
    
    -- HMRC Information
    -- NOTA: Completa con tus referencias de HMRC
    NULL, -- Tu UTR (Unique Taxpayer Reference)
    NULL, -- Tu Corporation Tax Reference
    NULL, -- Tu PAYE Reference (si tienes empleados)
    
    -- Directors & Officers
    'Raul Ortega Irus', -- Director from Companies House
    
    -- Share Capital
    1.00, -- £1 share capital from filing history
    1, -- 1 share
    
    -- Contact Information
    NULL, -- Tu email de contacto
    NULL, -- Tu teléfono de contacto
    'https://uhurutrade.com', -- Tu website
    
    -- Timestamps
    NOW(),
    NOW()
);

-- Verificar que se insertó correctamente
SELECT * FROM "CompanySettings" WHERE "companyNumber" = '15883242';
