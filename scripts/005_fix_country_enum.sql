-- Crear enum para países si no existe
DO $$ BEGIN
    CREATE TYPE country_enum AS ENUM (
        'AR', 'BR', 'CL', 'CO', 'EC', 'PE', 'UY', 'VE', 'BO', 'PY',
        'MX', 'US', 'CA', 'ES', 'FR', 'IT', 'DE', 'GB', 'PT', 'NL',
        'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PL', 'CZ',
        'HU', 'SK', 'SI', 'HR', 'RS', 'BG', 'RO', 'GR', 'TR', 'RU',
        'UA', 'BY', 'LT', 'LV', 'EE', 'JP', 'KR', 'CN', 'IN', 'AU',
        'NZ', 'ZA', 'EG', 'MA', 'NG', 'KE', 'GH', 'TN', 'DZ', 'ET'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Actualizar la columna country para usar el enum
ALTER TABLE profiles 
ALTER COLUMN country TYPE country_enum 
USING country::country_enum;

-- Establecer un valor por defecto
ALTER TABLE profiles 
ALTER COLUMN country SET DEFAULT 'AR';
