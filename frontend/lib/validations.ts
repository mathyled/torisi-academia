import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Course schema
export const courseSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(20, 'El código no puede exceder 20 caracteres'),
  name: z.string().min(1, 'El nombre es requerido').max(255, 'El nombre no puede exceder 255 caracteres'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional(),
  period: z.string().min(1, 'El período es requerido'),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// User schema
export const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255, 'El nombre no puede exceder 255 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: 'El rol debe ser student o teacher' }),
  }),
  dni: z.string().min(1, 'El DNI es requerido').max(20, 'El DNI no puede exceder 20 caracteres').optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// Enrollment schema
export const enrollmentSchema = z.object({
  user_id: z.number().int().positive('El usuario es requerido'),
  course_id: z.number().int().positive('El curso es requerido'),
});

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

// Grade schema
export const gradeSchema = z.object({
  score: z.number().min(0, 'La nota debe ser al menos 0').max(20, 'La nota no puede exceder 20').nullable(),
  period: z.string().min(1, 'El período es requerido'),
});

export type GradeFormData = z.infer<typeof gradeSchema>;
