'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export function LoginForm() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);

    try {
      await login(data);
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.errors) {
        setError(Object.values(err.errors).flat().join(' '));
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand Panel - 40% on desktop, header on mobile */}
      <div className="w-full md:w-[40%] bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center items-center p-8 md:p-12">
        <div className="text-center md:text-left w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">ITA</h1>
          <h2 className="text-xl md:text-2xl text-slate-200 mb-2">Instituto Técnico Automotriz</h2>
          <p className="text-slate-400 text-sm md:text-base">
            Sistema de gestión de calificaciones y cursos
          </p>
        </div>
      </div>

      {/* Login Form - 60% on desktop */}
      <div className="w-full md:w-[60%] flex items-center justify-center bg-white p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Iniciar sesión</h3>
            <p className="text-slate-600">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ita.edu.pe"
                {...register('email')}
                className="h-12"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="h-12"
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Acceso rápido para demo</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('email', 'admin@ita.edu.pe');
                  setValue('password', 'password');
                }}
                className="text-xs"
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('email', 'carlos.rios@ita.edu.pe');
                  setValue('password', 'password');
                }}
                className="text-xs"
              >
                Profesor
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('email', 'luis.quispe4@ita.edu.pe');
                  setValue('password', 'password');
                }}
                className="text-xs"
              >
                Alumno
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>¿Olvidaste tu contraseña? Contacta al administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
}
