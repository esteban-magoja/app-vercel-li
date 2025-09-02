"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Home, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

export default function CrearAnuncioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    tipo_operacion: "",
    tipo_inmueble: "",
    direccion: "",
    ciudad: "",
    country: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Obtener usuario actual
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("Usuario no autenticado")
      }

      // Crear anuncio
      const { data: anuncio, error } = await supabase
        .from("anuncios")
        .insert({
          ...formData,
          precio: Number.parseFloat(formData.precio),
          usuario_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Redirigir a la página de agregar imágenes
      router.push(`/dashboard/anuncio/${anuncio.id}/imagenes`)
    } catch (error) {
      console.error("Error creando anuncio:", error)
      alert("Error al crear el anuncio. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance">Publicar Anuncio</h1>
            <p className="text-muted-foreground">Completa los datos de tu propiedad</p>
          </div>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Información del Inmueble
            </CardTitle>
            <CardDescription>Proporciona los detalles básicos de tu propiedad</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título del Anuncio *</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Hermoso departamento en el centro"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe las características principales de tu propiedad..."
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Precio y Operación */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="precio"
                      type="number"
                      placeholder="0"
                      value={formData.precio}
                      onChange={(e) => handleInputChange("precio", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_operacion">Tipo de Operación *</Label>
                  <Select
                    value={formData.tipo_operacion}
                    onValueChange={(value) => handleInputChange("tipo_operacion", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona operación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                      <SelectItem value="alquiler_temporal">Alquiler Temporal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tipo de Inmueble */}
              <div className="space-y-2">
                <Label htmlFor="tipo_inmueble">Tipo de Inmueble *</Label>
                <Select
                  value={formData.tipo_inmueble}
                  onValueChange={(value) => handleInputChange("tipo_inmueble", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de inmueble" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departamento">Departamento</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="ph">PH</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="local">Local Comercial</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="cochera">Cochera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ubicación */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <Label className="text-base font-medium">Ubicación</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    placeholder="Ej: Av. Corrientes 1234"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Input
                      id="ciudad"
                      placeholder="Ej: Buenos Aires"
                      value={formData.ciudad}
                      onChange={(e) => handleInputChange("ciudad", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">País *</Label>
                    <Input
                      id="country"
                      placeholder="Ej: Argentina"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/dashboard">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creando..." : "Continuar con Imágenes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
