"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, ImageIcon, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface AnuncioImagen {
  id: string
  url: string
  orden: number
}

export default function AnuncioImagenesPage() {
  const router = useRouter()
  const params = useParams()
  const anuncioId = params.id as string

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagenes, setImagenes] = useState<AnuncioImagen[]>([])
  const [anuncio, setAnuncio] = useState<any>(null)

  useEffect(() => {
    loadAnuncio()
    loadImagenes()
  }, [anuncioId])

  const loadAnuncio = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("anuncios").select("*").eq("id", anuncioId).single()

      if (error) throw error
      setAnuncio(data)
    } catch (error) {
      console.error("Error cargando anuncio:", error)
    }
  }

  const loadImagenes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("anuncio_imagenes")
        .select("*")
        .eq("anuncio_id", anuncioId)
        .order("orden")

      if (error) throw error
      setImagenes(data || [])
    } catch (error) {
      console.error("Error cargando imágenes:", error)
    }
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      console.log("[v0] Iniciando upload de imagen:", file.name)
      const supabase = createClient()

      // Obtener usuario actual
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      console.log("[v0] Usuario obtenido:", user?.id)
      if (userError || !user) {
        console.log("[v0] Error de usuario:", userError)
        throw new Error("Usuario no autenticado")
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${anuncioId}_${Date.now()}.${fileExt}`
      console.log("[v0] Nombre de archivo generado:", fileName)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("anuncios_imagenes")
        .upload(fileName, file)

      console.log("[v0] Resultado upload storage:", { uploadData, uploadError })
      if (uploadError) throw uploadError

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("anuncios_imagenes").getPublicUrl(fileName)

      console.log("[v0] URL pública generada:", publicUrl)

      // Guardar referencia en la base de datos
      const nextOrden = imagenes.length + 1
      console.log("[v0] Insertando en DB:", { anuncio_id: anuncioId, url: publicUrl, orden: nextOrden })

      const { data: insertData, error: dbError } = await supabase.from("anuncio_imagenes").insert({
        anuncio_id: anuncioId,
        url: publicUrl,
        orden: nextOrden,
      })

      console.log("[v0] Resultado inserción DB:", { insertData, dbError })
      if (dbError) throw dbError

      console.log("[v0] Upload completado exitosamente")
      // Recargar imágenes
      await loadImagenes()
    } catch (error) {
      console.error("[v0] Error en uploadImage:", error)
      alert(`Error al subir la imagen: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async (imagenId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("anuncio_imagenes").delete().eq("id", imagenId)

      if (error) throw error
      await loadImagenes()
    } catch (error) {
      console.error("Error eliminando imagen:", error)
      alert("Error al eliminar la imagen.")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  const finalizarAnuncio = async () => {
    setLoading(true)
    try {
      if (imagenes.length === 0) {
        alert("Debes subir al menos una imagen para publicar el anuncio.")
        return
      }

      router.push("/dashboard/mis-anuncios")
    } catch (error) {
      console.error("Error finalizando anuncio:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance">Agregar Imágenes</h1>
            <p className="text-muted-foreground">{anuncio?.titulo || "Cargando..."}</p>
          </div>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Subir Imágenes
            </CardTitle>
            <CardDescription>Agrega fotos de tu propiedad. La primera imagen será la principal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80">
                      Haz clic para seleccionar archivos
                    </span>
                  </Label>
                  <p className="text-xs text-muted-foreground">PNG, JPG, JPEG hasta 10MB</p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              {uploading && <div className="text-center text-sm text-muted-foreground">Subiendo imagen...</div>}
            </div>
          </CardContent>
        </Card>

        {/* Imágenes Subidas */}
        {imagenes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del Anuncio ({imagenes.length})</CardTitle>
              <CardDescription>Puedes eliminar imágenes haciendo clic en el botón X</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {imagenes.map((imagen, index) => (
                  <div key={imagen.id} className="relative group">
                    <div className="aspect-video relative rounded-lg overflow-hidden border">
                      <Image
                        src={imagen.url || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteImage(imagen.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de Acción */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/dashboard">Guardar y Continuar Después</Link>
              </Button>
              <Button onClick={finalizarAnuncio} disabled={loading || imagenes.length === 0} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                {loading ? "Finalizando..." : "Publicar Anuncio"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
