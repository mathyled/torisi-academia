import type { 
  LoginRequest, 
  LoginResponse, 
  Course, 
  CourseWithTeacher, 
  StudentCourse, 
  EnrollmentStudent,
  Grade,
  User,
  Module,
  PaginationData
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend.test';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Error en la petición',
        response.status,
        data.errors
      );
    }

    return data as T;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/logout', {
      method: 'POST',
    });
  }

  // Student endpoints
  async getStudentCourses(): Promise<{ courses: StudentCourse[] }> {
    return this.request<{ courses: StudentCourse[] }>('/api/student/my-courses');
  }

  async getCourseClassmates(courseId: number): Promise<{ classmates: EnrollmentStudent[] }> {
    return this.request<{ classmates: EnrollmentStudent[] }>(`/api/student/courses/${courseId}/classmates`);
  }

  async getCourseModules(courseId: number): Promise<{ modules: Module[] }> {
    return this.request<{ modules: Module[] }>(`/api/student/courses/${courseId}/modules`);
  }

  // Teacher endpoints
  async getTeacherCourses(): Promise<{ courses: CourseWithTeacher[] }> {
    return this.request<{ courses: CourseWithTeacher[] }>('/api/teacher/courses');
  }

  async getCourseStudents(courseId: number): Promise<{ students: EnrollmentStudent[] }> {
    return this.request<{ students: EnrollmentStudent[] }>(`/api/teacher/courses/${courseId}/students`);
  }

  async updateGrade(gradeId: number, score: number, period: string): Promise<Grade> {
    return this.request<Grade>(`/api/teacher/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify({ score, period }),
    });
  }

  async createGrade(enrollmentId: number, score: number, period: string): Promise<Grade> {
    return this.request<Grade>('/api/teacher/grades', {
      method: 'POST',
      body: JSON.stringify({ enrollment_id: enrollmentId, score, period }),
    });
  }

  // Admin endpoints
  async getAdminCourses(params?: { page?: number; per_page?: number; search?: string; sortBy?: string; sortDirection?: string }): Promise<{ courses: Course[]; pagination: PaginationData }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params?.sortDirection) queryParams.append('sort_direction', params.sortDirection);
    const queryString = queryParams.toString();
    return this.request<{ courses: Course[]; pagination: PaginationData }>(`/api/admin/courses${queryString ? `?${queryString}` : ''}`);
  }

  async createCourse(course: { code: string; name: string; description?: string; period: string }): Promise<Course> {
    return this.request<Course>('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  }

  async deleteCourse(courseId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  async getUsers(params?: { page?: number; per_page?: number; search?: string; role?: string; sortBy?: string; sortDirection?: string }): Promise<{ users: User[]; pagination: PaginationData }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params?.sortDirection) queryParams.append('sort_direction', params.sortDirection);
    const queryString = queryParams.toString();
    return this.request<{ users: User[]; pagination: PaginationData }>(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async createUser(user: { name: string; email: string; password: string; role: 'student' | 'teacher'; dni?: string }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(userId: number, data: { name?: string; email?: string; dni?: string; role?: 'student' | 'teacher' }): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getEnrollments(params?: { page?: number; per_page?: number; search?: string; sortBy?: string; sortDirection?: string }): Promise<{ enrollments: any[]; pagination: PaginationData }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params?.sortDirection) queryParams.append('sort_direction', params.sortDirection);
    const queryString = queryParams.toString();
    return this.request<{ enrollments: any[]; pagination: PaginationData }>(`/api/admin/enrollments${queryString ? `?${queryString}` : ''}`);
  }

  async createEnrollment(userId: number, courseId: number): Promise<{ enrollment: any }> {
    return this.request<{ enrollment: any }>('/api/admin/enrollments', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, course_id: courseId }),
    });
  }

  async deleteEnrollment(enrollmentId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  }

  async assignTeacher(courseId: number, teacherId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/courses/${courseId}/assign-teacher`, {
      method: 'POST',
      body: JSON.stringify({ teacher_id: teacherId }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { ApiError };
