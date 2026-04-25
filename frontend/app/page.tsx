"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoginForm } from "@/components/LoginForm"
import Dashboard from "@/components/DashboardNew"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Dashboard />
  }

  return <LoginForm />
}
