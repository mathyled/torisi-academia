export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  dni?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  period: string;
  teacher?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: number;
  enrollment_id: number;
  score?: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface CourseWithTeacher extends Course {
  teacher?: User;
}

export interface StudentCourse {
  id: number;
  code: string;
  name: string;
  description?: string;
  period: string;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
  grade?: Grade;
}

export interface EnrollmentStudent {
  id: number; // enrollment_id
  user: {
    id: number;
    name: string;
    email: string;
    dni?: string;
    role: UserRole;
  };
  grade?: Grade;
}

export interface Module {
  id: number;
  course_id: number;
  name: string;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}
