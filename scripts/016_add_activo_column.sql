-- Agregar columna 'activo' a la tabla anuncios
ALTER TABLE anuncios 
ADD COLUMN activo boolean DEFAULT true NOT NULL;

-- Comentario: Esta columna permitirá marcar anuncios como activos/inactivos
-- Valor predeterminado: true (activo)
-- Todos los anuncios existentes se marcarán automáticamente como activos
