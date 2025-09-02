-- Deshabilitar RLS temporalmente para anuncio_imagenes para permitir inserciones
-- Esto es una solución temporal hasta que se configuren las políticas correctas

ALTER TABLE anuncio_imagenes DISABLE ROW LEVEL SECURITY;

-- Alternativamente, si quieres mantener RLS habilitado, 
-- puedes crear una política muy permisiva:
-- ALTER TABLE anuncio_imagenes ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow authenticated users to insert images" ON anuncio_imagenes
--   FOR INSERT TO authenticated
--   WITH CHECK (true);
-- 
-- CREATE POLICY "Allow everyone to view images" ON anuncio_imagenes
--   FOR SELECT TO public
--   USING (true);
-- 
-- CREATE POLICY "Allow users to delete their own anuncio images" ON anuncio_imagenes
--   FOR DELETE TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM anuncios 
--       WHERE anuncios.id = anuncio_imagenes.anuncio_id 
--       AND anuncios.usuario_id = auth.uid()
--     )
--   );
