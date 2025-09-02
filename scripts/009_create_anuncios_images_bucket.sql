-- Crear bucket para imágenes de anuncios
INSERT INTO storage.buckets (id, name, public)
VALUES ('anuncios_imagenes', 'anuncios_imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuarios autenticados suban imágenes
CREATE POLICY "Usuarios pueden subir sus propias imágenes de anuncios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'anuncios_imagenes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuarios autenticados vean todas las imágenes
CREATE POLICY "Todos pueden ver imágenes de anuncios"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'anuncios_imagenes');

-- Política para permitir que usuarios autenticados eliminen sus propias imágenes
CREATE POLICY "Usuarios pueden eliminar sus propias imágenes de anuncios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'anuncios_imagenes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
