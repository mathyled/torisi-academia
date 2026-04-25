"use client"

import { useState } from "react"
import { Car, Mail, Lock, Loader2, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onLogin: (role: string) => void
}

// Mock credentials for demo
const MOCK_USERS = [
  { email: "admin@ita.edu.mx", password: "admin123", role: "admin" },
  { email: "profesor@ita.edu.mx", password: "prof123", role: "professor" },
  { email: "estudiante@ita.edu.mx", password: "est123", role: "student" },
]

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (user) {
      onLogin(user.role)
    } else {
      setError("Credenciales inválidas. Por favor, verifica tu correo y contraseña.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Dark sidebar accent */}
      <div className="hidden lg:flex lg:w-2/5 bg-accent flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Car className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-accent-foreground">
                Instituto Técnico
              </h1>
              <p className="text-sm text-accent-foreground/70">Automotriz</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <blockquote className="space-y-3">
            <p className="text-lg text-accent-foreground/90 leading-relaxed">
              &ldquo;Formando a los mejores técnicos automotrices del país con
              excelencia académica y práctica profesional.&rdquo;
            </p>
            <footer className="text-sm text-accent-foreground/60">
              — Sistema de Gestión Académica
            </footer>
          </blockquote>
        </div>

        <div className="flex items-center gap-4 text-sm text-accent-foreground/50">
          <span>© 2024 ITA</span>
          <span>•</span>
          <span>Todos los derechos reservados</span>
        </div>
      </div>

      {/* Login form section */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile header */}
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Instituto Técnico Automotriz
                </h1>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema de calificaciones
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@ita.edu.mx"
                  required
                  className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-muted-foreground">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Ingresando...</span>
                </>
              ) : (
                <span>Ingresar</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              ¿Problemas para acceder?{" "}
              <button className="font-medium text-primary hover:text-primary/80 transition-colors">
                Contacta a soporte técnico
              </button>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Credenciales de prueba:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Admin: admin@ita.edu.mx / admin123</p>
              <p>Profesor: profesor@ita.edu.mx / prof123</p>
              <p>Estudiante: estudiante@ita.edu.mx / est123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
