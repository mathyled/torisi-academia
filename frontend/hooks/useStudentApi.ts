import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { StudentCourse, EnrollmentStudent, Module } from '@/types/api';

export function useStudentCourses(enabled: boolean = true) {
  const [data, setData] = useState<StudentCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getStudentCourses();
        setData(response.courses || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar cursos'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [enabled]);

  return { data, isLoading, error, refetch: () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    apiClient.getStudentCourses()
      .then((response) => setData(response.courses || []))
      .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar cursos')))
      .finally(() => setIsLoading(false));
  }};
}

export function useCourseClassmates(courseId: number | null) {
  const [data, setData] = useState<EnrollmentStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchClassmates = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getCourseClassmates(courseId);
        setData(response.classmates || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar compañeros'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassmates();
  }, [courseId]);

  return { data, isLoading, error, refetch: () => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    apiClient.getCourseClassmates(courseId)
      .then((response) => setData(response.classmates || []))
      .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar compañeros')))
      .finally(() => setIsLoading(false));
  }};
}

export function useCourseModules(courseId: number | null) {
  const [data, setData] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchModules = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getCourseModules(courseId);
        setData(response.modules || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar módulos'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  return { data, isLoading, error, refetch: () => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    apiClient.getCourseModules(courseId)
      .then((response) => setData(response.modules || []))
      .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar módulos')))
      .finally(() => setIsLoading(false));
  }};
}
