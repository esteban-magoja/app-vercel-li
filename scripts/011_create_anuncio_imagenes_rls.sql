-- Habilitar RLS en la tabla anuncio_imagenes
ALTER TABLE anuncio_imagenes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios vean todas las imágenes de anuncios (públicas)
CREATE POLICY "Permitir ver todas las imágenes de anuncios" ON anuncio_imagenes
FOR SELECT
TO authenticated, anon
USING (true);

-- Política para permitir que los usuarios inserten imágenes solo en sus propios anuncios
CREATE POLICY "Permitir insertar imágenes en anuncios propios" ON anuncio_imagenes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND anuncios.usuario_id = auth.uid()
  )
);

-- Política para permitir que los usuarios actualicen imágenes solo en sus propios anuncios
CREATE POLICY "Permitir actualizar imágenes en anuncios propios" ON anuncio_imagenes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND anuncios.usuario_id = auth.uid()
  )
);

-- Política para permitir que los usuarios eliminen imágenes solo en sus propios anuncios
CREATE POLICY "Permitir eliminar imágenes en anuncios propios" ON anuncio_imagenes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND anuncios.usuario_id = auth.uid()
  )
);
