-- Configurar políticas RLS para el bucket anuncios_imagenes existente
-- Este script configura las políticas necesarias para el bucket que ya fue creado manualmente

-- Habilitar RLS en storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuarios autenticados suban archivos al bucket anuncios_imagenes
CREATE POLICY "Usuarios pueden subir imágenes de anuncios" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'anuncios_imagenes');

-- Política para permitir que usuarios autenticados vean archivos del bucket anuncios_imagenes
CREATE POLICY "Usuarios pueden ver imágenes de anuncios" ON storage.objects
FOR SELECT TO authenticated, anon
USING (bucket_id = 'anuncios_imagenes');

-- Política para permitir que usuarios eliminen sus propias imágenes
CREATE POLICY "Usuarios pueden eliminar sus propias imágenes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'anuncios_imagenes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Verificar que el bucket existe y está configurado como público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'anuncios_imagenes';
