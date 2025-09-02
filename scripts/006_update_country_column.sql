-- Cambiar el campo country de enum a text para permitir códigos ISO estándar
-- Primero eliminamos el enum existente y cambiamos la columna a text
DO $$ 
BEGIN
    -- Cambiar la columna country a text si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ALTER COLUMN country TYPE text;
    END IF;
    
    -- Eliminar el enum si existe
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'country_enum') THEN
        DROP TYPE country_enum CASCADE;
    END IF;
END $$;

-- Agregar constraint para validar códigos de país ISO 3166-1 alpha-2
ALTER TABLE profiles 
ADD CONSTRAINT valid_country_code 
CHECK (country IS NULL OR country ~ '^[A-Z]{2}$');

-- Comentario explicativo
COMMENT ON COLUMN profiles.country IS 'ISO 3166-1 alpha-2 country code (e.g., AR, US, ES, MX)';
