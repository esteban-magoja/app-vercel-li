-- Crear políticas RLS para el bucket anuncios_imagenes
-- Estas políticas permiten a usuarios autenticados subir, ver y eliminar archivos

-- Política para permitir INSERT (upload) de archivos
CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'anuncios_imagenes');

-- Política para permitir SELECT (ver) archivos - público para que cualquiera pueda ver los anuncios
CREATE POLICY "Allow public to view anuncio images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'anuncios_imagenes');

-- Política para permitir UPDATE de archivos (solo el propietario)
CREATE POLICY "Allow users to update their own images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'anuncios_imagenes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir DELETE de archivos (solo el propietario)
CREATE POLICY "Allow users to delete their own images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'anuncios_imagenes' AND (storage.foldername(name))[1] = auth.uid()::text);
