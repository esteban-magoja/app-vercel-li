-- Crear bucket para imágenes de anuncios
INSERT INTO storage.buckets (id, name, public)
VALUES ('anuncios-imagenes', 'anuncios-imagenes', true);

-- Política para permitir que usuarios autenticados suban imágenes
CREATE POLICY "Usuarios pueden subir imágenes de anuncios" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'anuncios-imagenes');

-- Política para permitir que usuarios autenticados vean imágenes
CREATE POLICY "Usuarios pueden ver imágenes de anuncios" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'anuncios-imagenes');

-- Política para permitir que usuarios eliminen sus propias imágenes
CREATE POLICY "Usuarios pueden eliminar sus imágenes de anuncios" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'anuncios-imagenes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Habilitar RLS en storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
