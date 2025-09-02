-- Función para crear automáticamente un perfil cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, apellido)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', null),
    coalesce(new.raw_user_meta_data ->> 'apellido', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Eliminar trigger existente si existe
drop trigger if exists on_auth_user_created on auth.users;

-- Crear trigger para ejecutar la función cuando se crea un nuevo usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
