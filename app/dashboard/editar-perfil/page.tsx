"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  nombre: string | null
  apellido: string | null
  bio: string | null
  avatar_url: string | null
  country: string | null
}

export default function EditarPerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [bio, setBio] = useState("")
  const [country, setCountry] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (profileData) {
        setProfile(profileData)
        setNombre(profileData.nombre || "")
        setApellido(profileData.apellido || "")
        setBio(profileData.bio || "")
        setCountry(profileData.country || "")
        setAvatarUrl(profileData.avatar_url || "")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Error al cargar el perfil")
    }
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading avatar:", error)
      setError("Error al subir la imagen")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("La imagen debe ser menor a 2MB")
        return
      }
      setAvatarFile(file)
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      let finalAvatarUrl = avatarUrl

      // Subir nueva imagen si se seleccionó una
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile)
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl
        }
      }

      // Actualizar o insertar perfil
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        nombre,
        apellido,
        bio,
        country,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Perfil</CardTitle>
            <CardDescription>Actualiza tu información personal y foto de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Avatar" />
                  <AvatarFallback className="text-lg">{nombre && apellido ? getInitials() : "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Subiendo..." : "Cambiar Foto"}
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG o GIF. Máximo 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="CL">Chile</SelectItem>
                    <SelectItem value="CO">Colombia</SelectItem>
                    <SelectItem value="EC">Ecuador</SelectItem>
                    <SelectItem value="PE">Perú</SelectItem>
                    <SelectItem value="UY">Uruguay</SelectItem>
                    <SelectItem value="VE">Venezuela</SelectItem>
                    <SelectItem value="BO">Bolivia</SelectItem>
                    <SelectItem value="PY">Paraguay</SelectItem>
                    <SelectItem value="MX">México</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="CA">Canadá</SelectItem>
                    <SelectItem value="ES">España</SelectItem>
                    <SelectItem value="FR">Francia</SelectItem>
                    <SelectItem value="IT">Italia</SelectItem>
                    <SelectItem value="DE">Alemania</SelectItem>
                    <SelectItem value="GB">Reino Unido</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="NL">Países Bajos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={4}
                />
              </div>

              {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                  ¡Perfil actualizado exitosamente! Redirigiendo...
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || isUploading} className="flex-1">
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
