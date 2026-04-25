import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { Course, User, PaginationData } from '@/types/api';

export function useAdminCourses(enabled: boolean = true) {
  const [data, setData] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState({ page: 1, search: '', sortBy: 'name', sortDirection: 'asc' });

  useEffect(() => {
    if (!enabled) return;

    const fetchCourses = async () => {
      const hasData = data.length > 0;
      try {
        if (hasData) {
          setIsFetching(true);
        } else {
          setIsLoading(true);
        }
        const response = await apiClient.getAdminCourses(params);
        setData(response.courses || []);
        setPagination(response.pagination || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar cursos'));
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchCourses();
  }, [enabled, params]);

  const refetch = () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    apiClient.getAdminCourses(params)
      .then((response) => {
        setData(response.courses || []);
        setPagination(response.pagination || null);
      })
      .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar cursos')))
      .finally(() => setIsLoading(false));
  };

  const setPage = (page: number) => setParams(prev => ({ ...prev, page }));
  const setSearch = (search: string) => setParams(prev => ({ ...prev, search, page: 1 }));
  const setSort = (sortBy: string, sortDirection: 'asc' | 'desc') => 
    setParams(prev => ({ ...prev, sortBy, sortDirection, page: 1 }));

  return { data, pagination, isLoading, isFetching, error, refetch, setPage, setSearch, setSort };
}

export function useUsers() {
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState({ page: 1, search: '', role: '', sortBy: 'name', sortDirection: 'asc' });

  useEffect(() => {
    const fetchUsers = async () => {
      const hasData = data.length > 0;
      try {
        if (hasData) {
          setIsFetching(true);
        } else {
          setIsLoading(true);
        }
        const response = await apiClient.getUsers(params);
        setData(response.users || []);
        setPagination(response.pagination || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar usuarios'));
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, [params]);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    apiClient.getUsers(params)
      .then((response) => {
        setData(response.users || []);
        setPagination(response.pagination || null);
      })
      .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar usuarios')))
      .finally(() => setIsLoading(false));
  };

  const setPage = (page: number) => setParams(prev => ({ ...prev, page }));
  const setSearch = (search: string) => setParams(prev => ({ ...prev, search, page: 1 }));
  const setRole = (role: string) => setParams(prev => ({ ...prev, role, page: 1 }));
  const setSort = (sortBy: string, sortDirection: 'asc' | 'desc') => 
    setParams(prev => ({ ...prev, sortBy, sortDirection, page: 1 }));

  return { data, pagination, isLoading, isFetching, error, refetch, setPage, setSearch, setRole, setSort };
}

export function useEnrollments() {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState({ page: 1, search: '', sortBy: 'id', sortDirection: 'asc' });

  useEffect(() => {
    const fetchEnrollments = async () => {
      const hasData = data.length > 0;
      try {
        if (hasData) {
          setIsFetching(true);
        } else {
          setIsLoading(true);
        }
        const response = await apiClient.getEnrollments(params);
        setData(response.enrollments || []);
        setPagination(response.pagination || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar matrículas'));
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchEnrollments();
  }, [params]);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    apiClient.getEnrollments(params)
      .then((response) => {
        setData(response.enrollments || []);
        setPagination(response.pagination || null);
      })
      .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar matrículas')))
      .finally(() => setIsLoading(false));
  };

  const setPage = (page: number) => setParams(prev => ({ ...prev, page }));
  const setSearch = (search: string) => setParams(prev => ({ ...prev, search, page: 1 }));
  const setSort = (sortBy: string, sortDirection: 'asc' | 'desc') => 
    setParams(prev => ({ ...prev, sortBy, sortDirection, page: 1 }));

  return { data, pagination, isLoading, isFetching, error, refetch, setPage, setSearch, setSort };
}

export function useCourseManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCourse = async (course: { code: string; name: string; description?: string; period: string }): Promise<Course | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newCourse = await apiClient.createCourse(course);
      return newCourse;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear curso'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.deleteCourse(courseId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar curso'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const assignTeacher = async (courseId: number, teacherId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.assignTeacher(courseId, teacherId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al asignar profesor'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCourse, deleteCourse, assignTeacher, isLoading, error };
}

export function useUserManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUser = async (user: { name: string; email: string; password: string; role: 'student' | 'teacher'; dni?: string }): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.createUser(user);
      return response.user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear usuario'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: number, data: { name?: string; email?: string; dni?: string; role?: 'student' | 'teacher' }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.updateUser(userId, data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al actualizar usuario'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.deleteUser(userId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar usuario'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, updateUser, deleteUser, isLoading, error };
}

export function useEnrollmentManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEnrollment = async (userId: number, courseId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.createEnrollment(userId, courseId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear matrícula'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEnrollment = async (enrollmentId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.deleteEnrollment(enrollmentId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar matrícula'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createEnrollment, deleteEnrollment, isLoading, error };
}
