"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Eye, MapPin, Calendar, DollarSign, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function MisAnunciosPage() {
  const [user, setUser] = useState(null)
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        redirect("/auth/login")
        return
      }
      setUser(data.user)
      await fetchAnuncios(data.user.id)
    }
    getUser()
  }, [])

  async function fetchAnuncios(userId) {
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select(`
          *,
          anuncio_imagenes (
            id,
            url,
            orden
          )
        `)
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const anunciosWithActivo = (data || []).map((anuncio) => ({
        ...anuncio,
        activo: anuncio.activo !== undefined ? anuncio.activo : true,
      }))

      setAnuncios(anunciosWithActivo)
    } catch (error) {
      console.error("Error fetching anuncios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los anuncios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function deleteAnuncio(anuncioId) {
    if (!user) return

    setDeletingId(anuncioId)

    try {
      console.log("[v0] Iniciando eliminación del anuncio:", anuncioId)

      // 1. Obtener todas las imágenes del anuncio
      const { data: imagenes, error: imagenesError } = await supabase
        .from("anuncio_imagenes")
        .select("url")
        .eq("anuncio_id", anuncioId)

      if (imagenesError) {
        console.error("[v0] Error obteniendo imágenes:", imagenesError)
        throw imagenesError
      }

      console.log("[v0] Imágenes encontradas:", imagenes?.length || 0)

      // 2. Eliminar archivos del storage
      if (imagenes && imagenes.length > 0) {
        for (const imagen of imagenes) {
          // Extraer el path del archivo de la URL
          const urlParts = imagen.url.split("/")
          const fileName = urlParts[urlParts.length - 1]
          const filePath = `${user.id}/${fileName}`

          console.log("[v0] Eliminando archivo del storage:", filePath)

          const { error: storageError } = await supabase.storage.from("anuncios_imagenes").remove([filePath])

          if (storageError) {
            console.error("[v0] Error eliminando archivo del storage:", storageError)
          }
        }
      }

      // 3. Eliminar registros de anuncio_imagenes
      console.log("[v0] Eliminando registros de anuncio_imagenes")
      const { error: imagenesDeleteError } = await supabase
        .from("anuncio_imagenes")
        .delete()
        .eq("anuncio_id", anuncioId)

      if (imagenesDeleteError) {
        console.error("[v0] Error eliminando registros de imágenes:", imagenesDeleteError)
        throw imagenesDeleteError
      }

      // 4. Eliminar el anuncio
      console.log("[v0] Eliminando anuncio")
      const { error: anuncioDeleteError } = await supabase
        .from("anuncios")
        .delete()
        .eq("id", anuncioId)
        .eq("usuario_id", user.id) // Verificar que sea del usuario

      if (anuncioDeleteError) {
        console.error("[v0] Error eliminando anuncio:", anuncioDeleteError)
        throw anuncioDeleteError
      }

      console.log("[v0] Anuncio eliminado exitosamente")

      // 5. Actualizar la lista local
      setAnuncios((prev) => prev.filter((a) => a.id !== anuncioId))

      toast({
        title: "Anuncio eliminado",
        description: "El anuncio y todas sus imágenes han sido eliminados correctamente",
      })
    } catch (error) {
      console.error("[v0] Error eliminando anuncio:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el anuncio. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p>Cargando anuncios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">Mis Anuncios</h1>
              <p className="text-muted-foreground">Gestiona tus propiedades publicadas</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/crear-anuncio">Nuevo Anuncio</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anuncios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anuncios?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{anuncios?.filter((a) => a.activo).length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">{anuncios?.filter((a) => !a.activo).length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {anuncios?.filter((a) => {
                  const created = new Date(a.created_at)
                  const now = new Date()
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                }).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Anuncios */}
        {!anuncios || anuncios.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">No tienes anuncios publicados</h3>
                <p className="text-muted-foreground">
                  Comienza publicando tu primera propiedad para llegar a más clientes
                </p>
                <Button asChild>
                  <Link href="/dashboard/crear-anuncio">Crear Primer Anuncio</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {anuncios.map((anuncio) => {
              const primeraImagen =
                anuncio.anuncio_imagenes?.find((img) => img.orden === 1) || anuncio.anuncio_imagenes?.[0]

              return (
                <Card key={anuncio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Imagen */}
                  <div className="relative h-48 bg-gray-100">
                    {primeraImagen ? (
                      <Image
                        src={primeraImagen.url || "/placeholder.svg"}
                        alt={anuncio.titulo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">Sin imagen</div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={anuncio.activo ? "default" : "secondary"}>
                        {anuncio.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>

                  {/* Contenido */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{anuncio.titulo}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{anuncio.tipo_operacion}</Badge>
                      <Badge variant="outline">{anuncio.tipo_inmueble}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Precio */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-xl font-bold text-green-600">{formatPrice(anuncio.precio)}</span>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{anuncio.ciudad}</span>
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Publicado {formatDate(anuncio.created_at)}</span>
                    </div>

                    {/* Descripción */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{anuncio.descripcion}</p>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === anuncio.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el anuncio "
                              {anuncio.titulo}" y todas sus imágenes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAnuncio(anuncio.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingId === anuncio.id}
                            >
                              {deletingId === anuncio.id ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
