import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const user = data.user

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { count: anunciosActivos } = await supabase
    .from("anuncios")
    .select("*", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .eq("activo", true)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ""} alt="Avatar" />
              <AvatarFallback className="text-lg">
                {profile?.nombre?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-balance">Panel de Control</h1>
              <p className="text-muted-foreground">
                Bienvenido de vuelta, {profile?.nombre || user.user_metadata?.nombre || user.email}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado de la Cuenta</CardTitle>
              <CardDescription>Información de seguridad y acceso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <p className="text-lg font-bold text-primary">Activa</p>
                  <p className="text-xs text-muted-foreground">Tu cuenta está verificada y activa</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Último Acceso</p>
                  <p className="text-lg font-bold">Hoy</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.last_sign_in_at || "").toLocaleString("es-ES")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Seguridad</p>
                  <p className="text-lg font-bold text-primary">Segura</p>
                  <p className="text-xs text-muted-foreground">Email confirmado y protegido</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Anuncios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{anunciosActivos || 0}</div>
              <p className="text-sm text-muted-foreground mb-4">Anuncios publicados y activos</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/mis-anuncios">Ver Mis Anuncios</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona tu cuenta y configuración</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/editar-perfil">Editar Perfil</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/crear-anuncio">Publicar Anuncio</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/mis-anuncios">Ver Mis Anuncios</Link>
              </Button>
              <Button variant="outline">Cambiar Contraseña</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Usuario</CardTitle>
            <CardDescription>Detalles de tu cuenta y perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="text-sm">{profile?.nombre || user.user_metadata?.nombre || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apellido</p>
                <p className="text-sm">{profile?.apellido || user.user_metadata?.apellido || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">País</p>
                <p className="text-sm">{profile?.country || user.user_metadata?.country || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bio</p>
                <p className="text-sm">{profile?.bio || "No especificada"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
                <p className="text-sm">{new Date(user.created_at).toLocaleDateString("es-ES")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
