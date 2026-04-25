import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { CourseWithTeacher, EnrollmentStudent, Grade } from '@/types/api';

export function useTeacherCourses(enabled: boolean = true) {
  const [data, setData] = useState<CourseWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getTeacherCourses();
        setData(response.courses || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar cursos'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [enabled]);

  const refetch = () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    apiClient.getTeacherCourses()
      .then((response) => setData(response.courses || []))
      .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar cursos')))
      .finally(() => setIsLoading(false));
  };

  return { data, isLoading, error, refetch };
}

export function useCourseStudents(courseId: number) {
  const [data, setData] = useState<EnrollmentStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getCourseStudents(courseId);
        setData(response.students || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar estudiantes'));
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const refetch = () => {
    if (courseId) {
      setIsLoading(true);
      setError(null);
      apiClient.getCourseStudents(courseId)
        .then((response) => setData(response.students || []))
        .catch(err => setError(err instanceof Error ? err : new Error('Error al cargar estudiantes')))
        .finally(() => setIsLoading(false));
    }
  };

  return { data, isLoading, error, refetch };
}

export function useUpdateGrade() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateGrade = async (gradeId: number, score: number, period: string): Promise<Grade | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const grade = await apiClient.updateGrade(gradeId, score, period);
      return grade;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al actualizar nota'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createGrade = async (enrollmentId: number, score: number, period: string): Promise<Grade | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const grade = await apiClient.createGrade(enrollmentId, score, period);
      return grade;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear nota'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateGrade, createGrade, isLoading, error };
}
