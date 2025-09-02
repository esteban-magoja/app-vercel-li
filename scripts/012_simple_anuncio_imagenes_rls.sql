-- Habilitar RLS en la tabla anuncio_imagenes si no está habilitado
ALTER TABLE anuncio_imagenes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can insert images for their announcements" ON anuncio_imagenes;
DROP POLICY IF EXISTS "Users can view all announcement images" ON anuncio_imagenes;
DROP POLICY IF EXISTS "Users can update their announcement images" ON anuncio_imagenes;
DROP POLICY IF EXISTS "Users can delete their announcement images" ON anuncio_imagenes;

-- Política simple para permitir INSERT a usuarios autenticados
CREATE POLICY "Authenticated users can insert images" ON anuncio_imagenes
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Política para permitir SELECT a todos (anuncios son públicos)
CREATE POLICY "Anyone can view images" ON anuncio_imagenes
    FOR SELECT TO public
    USING (true);

-- Política para permitir UPDATE solo al propietario del anuncio
CREATE POLICY "Users can update their images" ON anuncio_imagenes
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM anuncios 
            WHERE anuncios.id = anuncio_imagenes.anuncio_id 
            AND anuncios.user_id = auth.uid()
        )
    );

-- Política para permitir DELETE solo al propietario del anuncio
CREATE POLICY "Users can delete their images" ON anuncio_imagenes
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM anuncios 
            WHERE anuncios.id = anuncio_imagenes.anuncio_id 
            AND anuncios.user_id = auth.uid()
        )
    );
