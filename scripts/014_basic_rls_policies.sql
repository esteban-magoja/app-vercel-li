-- Políticas RLS básicas para anuncio_imagenes
-- Estas políticas son muy permisivas para evitar errores

-- Habilitar RLS en la tabla anuncio_imagenes
ALTER TABLE anuncio_imagenes ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT a todos (anuncios son públicos)
CREATE POLICY "Permitir SELECT a todos" ON anuncio_imagenes
    FOR SELECT USING (true);

-- Política para permitir INSERT a usuarios autenticados
CREATE POLICY "Permitir INSERT a usuarios autenticados" ON anuncio_imagenes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir UPDATE a usuarios autenticados
CREATE POLICY "Permitir UPDATE a usuarios autenticados" ON anuncio_imagenes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir DELETE a usuarios autenticados
CREATE POLICY "Permitir DELETE a usuarios autenticados" ON anuncio_imagenes
    FOR DELETE USING (auth.role() = 'authenticated');
