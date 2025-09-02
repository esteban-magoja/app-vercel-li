-- Habilitar RLS y crear políticas de seguridad para las tablas de anuncios

-- Habilitar RLS en la tabla anuncios
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean anuncios activos (públicos) o sus propios anuncios
CREATE POLICY "anuncios_select_policy" ON anuncios
FOR SELECT USING (
  activo = true OR usuario_id = auth.uid()
);

-- Política para que los usuarios solo puedan insertar anuncios con su propio usuario_id
CREATE POLICY "anuncios_insert_policy" ON anuncios
FOR INSERT WITH CHECK (
  usuario_id = auth.uid()
);

-- Política para que los usuarios solo puedan actualizar sus propios anuncios
CREATE POLICY "anuncios_update_policy" ON anuncios
FOR UPDATE USING (
  usuario_id = auth.uid()
) WITH CHECK (
  usuario_id = auth.uid()
);

-- Política para que los usuarios solo puedan eliminar sus propios anuncios
CREATE POLICY "anuncios_delete_policy" ON anuncios
FOR DELETE USING (
  usuario_id = auth.uid()
);

-- Habilitar RLS en la tabla anuncio_imagenes
ALTER TABLE anuncio_imagenes ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda ver las imágenes de anuncios activos
CREATE POLICY "anuncio_imagenes_select_policy" ON anuncio_imagenes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND (anuncios.activo = true OR anuncios.usuario_id = auth.uid())
  )
);

-- Política para que los usuarios solo puedan insertar imágenes en sus propios anuncios
CREATE POLICY "anuncio_imagenes_insert_policy" ON anuncio_imagenes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND anuncios.usuario_id = auth.uid()
  )
);

-- Política para que los usuarios solo puedan actualizar imágenes de sus propios anuncios
CREATE POLICY "anuncio_imagenes_update_policy" ON anuncio_imagenes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND anuncios.usuario_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND anuncios.usuario_id = auth.uid()
  )
);

-- Política para que los usuarios solo puedan eliminar imágenes de sus propios anuncios
CREATE POLICY "anuncio_imagenes_delete_policy" ON anuncio_imagenes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM anuncios 
    WHERE anuncios.id = anuncio_imagenes.anuncio_id 
    AND anuncios.usuario_id = auth.uid()
  )
);
