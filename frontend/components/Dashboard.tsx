'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses, useCourseClassmates, useCourseModules } from '@/hooks/useStudentApi';
import { useTeacherCourses, useCourseStudents, useUpdateGrade } from '@/hooks/useTeacherApi';
import { useAdminCourses, useUsers, useEnrollments, useCourseManagement, useUserManagement, useEnrollmentManagement } from '@/hooks/useAdminApi';
import { courseSchema, userSchema, type CourseFormData, type UserFormData } from '@/lib/validations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, Settings, LogOut, LayoutDashboard, Plus, Trash2, UserPlus, Pencil, ClipboardList, Search, Grid3x3, List, ArrowUpDown, CheckCircle, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

type ViewMode = 'grid' | 'list';
type SortOrder = 'asc' | 'desc';

function DashboardContent() {
  const { user, logout } = useAuth();

  // Teacher grading state
  const [selectedTeacherCourse, setSelectedTeacherCourse] = useState<any>(null);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [editGradeValue, setEditGradeValue] = useState<string>('');
  const [gradeToast, setGradeToast] = useState<{ show: boolean; studentName: string }>({ show: false, studentName: '' });

  const { data: studentCourses, isLoading: studentLoading } = useStudentCourses(user?.role === 'student');
  
  // Student classmates state
  const [selectedStudentCourse, setSelectedStudentCourse] = useState<any>(null);
  const { data: classmates, isLoading: classmatesLoading } = useCourseClassmates(selectedStudentCourse?.id || null);
  const { data: modules, isLoading: modulesLoading } = useCourseModules(selectedStudentCourse?.id || null);
  const { data: teacherCourses, isLoading: teacherLoading } = useTeacherCourses(user?.role === 'teacher');
  const { data: courseStudents, isLoading: studentsLoading, refetch: refetchStudents } = useCourseStudents(selectedTeacherCourse?.id || 0);
  const { updateGrade, createGrade, isLoading: gradeLoading } = useUpdateGrade();
  const { 
    data: adminCourses, 
    pagination: coursesPagination, 
    isLoading: adminLoading,
    isFetching: adminFetching,
    refetch: refetchCourses,
    setPage: setCoursesPage,
  } = useAdminCourses(user?.role === 'admin');
  const { 
    data: users, 
    pagination: usersPagination, 
    isLoading: usersLoading,
    isFetching: usersFetching,
    refetch: refetchUsers,
    setPage: setUsersPage,
  } = useUsers();
  const { 
    data: enrollments, 
    pagination: enrollmentsPagination, 
    isLoading: enrollmentsLoading,
    isFetching: enrollmentsFetching,
    refetch: refetchEnrollments,
    setPage: setEnrollmentsPage,
  } = useEnrollments();

  // Memoize pagination page numbers to prevent recreation
  const coursePageNumbers = useMemo(() => {
    if (!coursesPagination) return [];
    return Array.from({ length: coursesPagination.last_page }, (_, i) => i + 1);
  }, [coursesPagination?.last_page]);

  const usersPageNumbers = useMemo(() => {
    if (!usersPagination) return [];
    return Array.from({ length: usersPagination.last_page }, (_, i) => i + 1);
  }, [usersPagination?.last_page]);

  const enrollmentsPageNumbers = useMemo(() => {
    if (!enrollmentsPagination) return [];
    return Array.from({ length: enrollmentsPagination.last_page }, (_, i) => i + 1);
  }, [enrollmentsPagination?.last_page]);
  const { createCourse, deleteCourse, assignTeacher, isLoading: courseManagementLoading } = useCourseManagement();
  const { createUser, updateUser, deleteUser, isLoading: userManagementLoading } = useUserManagement();
  const { createEnrollment, deleteEnrollment, isLoading: enrollmentManagementLoading } = useEnrollmentManagement();

  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'enrollments'>('courses');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'period'>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Normalize text by removing accents
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Course modals
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');

  const courseForm = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      period: '2025-I',
    },
  });

  // User modals
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      dni: '',
    },
  });

  // Enrollment modals
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleCreateCourse = async (data: CourseFormData) => {
    const result = await createCourse(data);
    if (result) {
      setShowNewCourseModal(false);
      courseForm.reset();
      refetchCourses();
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    const result = await deleteCourse(courseId);
    if (result) refetchCourses();
  };

  const handleAssignTeacher = async () => {
    if (!selectedCourse || !selectedTeacher) return;
    const result = await assignTeacher(selectedCourse.id, selectedTeacher);
    if (result) {
      setSelectedCourse(null);
      setSelectedTeacher('');
      refetchCourses();
    }
  };

  const handleCreateUser = async (data: UserFormData) => {
    const result = await createUser(data);
    if (result) {
      setShowNewUserModal(false);
      userForm.reset();
      refetchUsers();
    }
  };

  const handleUpdateUser = async (userId: number, role: 'student' | 'teacher') => {
    const result = await updateUser(userId, role);
    if (result) refetchUsers();
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await deleteUser(userId);
    if (result) refetchUsers();
  };

  const handleCreateEnrollment = async () => {
    if (!selectedStudentId || !selectedCourseId) return;
    
    // Verificar si el alumno ya está matriculado en este curso
    const alreadyEnrolled = enrollments?.some((e: any) => 
      e.user_id === selectedStudentId && e.course_id === selectedCourseId
    );
    
    if (alreadyEnrolled) {
      const studentName = students.find(s => s.id === selectedStudentId)?.name;
      const courseName = adminCourses?.find(c => c.id === selectedCourseId)?.name;
      setEnrollmentError(`El alumno "${studentName}" ya está matriculado en el curso "${courseName}"`);
      return;
    }
    
    setEnrollmentError(null);
    const result = await createEnrollment(selectedStudentId, selectedCourseId);
    if (result) {
      setSelectedStudentId('');
      setSelectedCourseId('');
      refetchEnrollments();
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    const result = await deleteEnrollment(enrollmentId);
    if (result) refetchEnrollments();
  };

  // Teacher grading handlers
  const handleEditGrade = (student: any) => {
    setEditingGradeId(student.grade?.id || null);
    setEditGradeValue(student.grade?.score !== null ? student.grade.score.toString() : '');
  };

  const handleCancelGrade = () => {
    setEditingGradeId(null);
    setEditGradeValue('');
  };

  const handleSaveGrade = async (student: any) => {
    const score = editGradeValue === '' ? null : Math.min(20, Math.max(0, parseInt(editGradeValue, 10)));
    
    if (score === null) {
      setEditingGradeId(null);
      setEditGradeValue('');
      return;
    }
    
    if (student.grade) {
      // Update existing grade
      const result = await updateGrade(student.grade.id, score, selectedTeacherCourse.period);
      if (result) {
        setGradeToast({ show: true, studentName: student.user.name });
        setTimeout(() => setGradeToast({ show: false, studentName: '' }), 3000);
        refetchStudents();
      }
    } else {
      // Create new grade
      const result = await createGrade(student.id, score, selectedTeacherCourse.period);
      if (result) {
        setGradeToast({ show: true, studentName: student.user.name });
        setTimeout(() => setGradeToast({ show: false, studentName: '' }), 3000);
        refetchStudents();
      }
    }
    
    setEditingGradeId(null);
    setEditGradeValue('');
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      student: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      teacher: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    };
    const labels = {
      student: 'Alumno',
      teacher: 'Profesor',
      admin: 'Admin',
    };
    return (
      <Badge className={styles[role as keyof typeof styles]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">Cargando usuario...</div>;
  }

  const teachers = users?.filter(u => u.role === 'teacher') || [];
  const students = users?.filter(u => u.role === 'student') || [];
  const filteredUsers = users?.filter(u => roleFilter === 'all' || u.role === roleFilter) || [];

  // Count courses per teacher
  const teacherCourseCount = (userId: number) => {
    return adminCourses?.filter(c => c.teacher?.id === userId).length || 0;
  };

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let courses = adminCourses || [];
    
    if (searchQuery) {
      const normalizedQuery = normalizeText(searchQuery);
      courses = courses.filter(c => 
        normalizeText(c.name).includes(normalizedQuery) ||
        normalizeText(c.code).includes(normalizedQuery)
      );
    }

    courses = [...courses].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return courses;
  }, [adminCourses, searchQuery, sortBy, sortOrder]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let usersList = filteredUsers || [];
    
    if (searchQuery) {
      const normalizedQuery = normalizeText(searchQuery);
      usersList = usersList.filter(u => 
        normalizeText(u.name).includes(normalizedQuery) ||
        normalizeText(u.email).includes(normalizedQuery)
      );
    }

    usersList = [...usersList].sort((a, b) => {
      const aVal = a.name;
      const bVal = b.name;
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return usersList;
  }, [filteredUsers, searchQuery, sortOrder]);

  // Filter and sort enrollments
  const filteredAndSortedEnrollments = useMemo(() => {
    let enrollmentsList = enrollments || [];
    
    if (searchQuery) {
      const normalizedQuery = normalizeText(searchQuery);
      enrollmentsList = enrollmentsList.filter((e: any) => 
        normalizeText(e.user?.name || '').includes(normalizedQuery) ||
        normalizeText(e.course?.name || '').includes(normalizedQuery)
      );
    }

    enrollmentsList = [...enrollmentsList].sort((a: any, b: any) => {
      const aVal = a.user?.name || '';
      const bVal = b.user?.name || '';
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return enrollmentsList;
  }, [enrollments, searchQuery, sortOrder]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Sidebar className="border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <SidebarHeader className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg">
                ITA
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">ITA</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Calificaciones</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-500 dark:text-slate-400">Menú Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab('courses')} isActive={activeTab === 'courses'} className="data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-900/20 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300">
                      <BookOpen />
                      <span>Cursos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setActiveTab('users')} isActive={activeTab === 'users'} className="data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-900/20 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300">
                          <Users />
                          <span>Usuarios</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setActiveTab('enrollments')} isActive={activeTab === 'enrollments'} className="data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-900/20 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300">
                          <ClipboardList />
                          <span>Matrículas</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings />
                      <span>Configuración</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-slate-200 dark:border-slate-700">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                  <LogOut />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="flex items-center gap-4 p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Bienvenido, {user.name}</p>
            </div>
            <Badge variant="outline" className="border-slate-300 dark:border-slate-600">
              {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Profesor' : 'Alumno'}
            </Badge>
          </div>
          <div className="p-6">
            {user.role === 'student' && (
              <div>
                {!selectedStudentCourse ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Mis Cursos</h3>
                    </div>
                    {studentLoading ? (
                      <div className="text-center py-12 text-slate-500">Cargando cursos...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studentCourses?.map((course) => (
                          <Card key={course.id} className="border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => setSelectedStudentCourse(course)}>
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <Badge variant="outline" className="mb-2 text-xs font-medium border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                                    {course.code}
                                  </Badge>
                                  <CardTitle className="text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.name}</CardTitle>
                                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">{course.period}</CardDescription>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {course.teacher && (
                                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Profesor</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{course.teacher.name}</span>
                                  </div>
                                )}
                                {course.grade ? (
                                  <>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                      <span className="text-sm text-slate-600 dark:text-slate-400">Nota</span>
                                      <span className={`text-lg font-bold ${course.grade.score && course.grade.score >= 11 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {course.grade.score ?? 'Pendiente'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-slate-600 dark:text-slate-400">Periodo</span>
                                      <span className="text-slate-900 dark:text-white font-medium">{course.grade.period}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <span className="text-sm text-slate-500 dark:text-slate-500">Sin calificación</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <Button variant="outline" onClick={() => setSelectedStudentCourse(null)}>
                        ← Volver a cursos
                      </Button>
                    </div>
                    
                    <Card className="border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-slate-900 dark:text-white">{selectedStudentCourse.name}</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">{selectedStudentCourse.code} - {selectedStudentCourse.period}</CardDescription>
                          </div>
                          {selectedStudentCourse.teacher && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                              Profesor: {selectedStudentCourse.teacher.name}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Módulos del Curso</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {modulesLoading ? (
                          <div className="text-center py-12 text-slate-500">Cargando módulos...</div>
                        ) : modules && modules.length > 0 ? (
                          <div className="space-y-3">
                            {modules.map((module: any) => (
                              <div key={module.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                    {module.order}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{module.name}</h4>
                                    {module.description && (
                                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{module.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-500">No hay módulos disponibles en este curso.</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Mis Compañeros</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {classmatesLoading ? (
                          <div className="text-center py-12 text-slate-500">Cargando compañeros...</div>
                        ) : classmates && classmates.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <TableHead className="font-semibold text-slate-900 dark:text-white">#</TableHead>
                                <TableHead className="font-semibold text-slate-900 dark:text-white">Nombre</TableHead>
                                <TableHead className="font-semibold text-slate-900 dark:text-white">DNI</TableHead>
                                <TableHead className="font-semibold text-slate-900 dark:text-white">Nota</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {classmates.map((classmate: any, index: number) => (
                                <TableRow key={classmate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <TableCell className="font-medium text-slate-900 dark:text-white">{index + 1}</TableCell>
                                  <TableCell className="text-slate-900 dark:text-white font-medium">{classmate.user?.name}</TableCell>
                                  <TableCell className="text-slate-600 dark:text-slate-400 font-mono">{classmate.user?.dni || '-'}</TableCell>
                                  <TableCell>
                                    {classmate.grade?.score !== null ? (
                                      <span className={`font-semibold ${classmate.grade.score >= 11 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {classmate.grade.score}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-12 text-slate-500">No hay compañeros matriculados en este curso.</div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}

            {user.role === 'teacher' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Gestión de Calificaciones</h3>
                </div>
                
                {gradeToast.show && (
                  <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Nota de {gradeToast.studentName} actualizada correctamente
                    </span>
                  </div>
                )}

                {!selectedTeacherCourse ? (
                  <>
                    {teacherLoading ? (
                      <div className="text-center py-12 text-slate-500">Cargando cursos...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teacherCourses?.map((course) => (
                          <Card key={course.id} className="border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => setSelectedTeacherCourse(course)}>
                            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <Badge variant="outline" className="mb-2 text-xs font-medium border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">
                                    {course.code}
                                  </Badge>
                                  <CardTitle className="text-slate-900 dark:text-white text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{course.name}</CardTitle>
                                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">{course.period}</CardDescription>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {course.description || 'Sin descripción'}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <Button variant="outline" onClick={() => setSelectedTeacherCourse(null)}>
                        ← Volver a cursos
                      </Button>
                    </div>
                    
                    <Card className="border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-slate-900 dark:text-white">{selectedTeacherCourse.name}</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">{selectedTeacherCourse.code} - {selectedTeacherCourse.period}</CardDescription>
                          </div>
                          <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">
                            {selectedTeacherCourse.code}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>

                    {studentsLoading ? (
                      <div className="text-center py-12 text-slate-500">Cargando estudiantes...</div>
                    ) : (
                      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="font-semibold text-slate-900 dark:text-white">#</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Alumno</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">DNI</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Nota Actual</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Nueva Nota</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Estado</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Acción</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {courseStudents?.map((student: any, index: number) => {
                              const isEditing = editingGradeId === student.grade?.id;
                              const score = student.grade?.score;
                              const status = score !== null ? (score >= 11 ? 'Aprobado' : 'Desaprobado') : 'Pendiente';
                              const statusColor = score !== null ? (score >= 11 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400') : 'text-slate-500';
                              
                              return (
                                <TableRow key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <TableCell className="font-medium text-slate-900 dark:text-white">{index + 1}</TableCell>
                                  <TableCell className="text-slate-900 dark:text-white font-medium">{student.user?.name}</TableCell>
                                  <TableCell className="text-slate-600 dark:text-slate-400 font-mono">{student.user?.dni || '-'}</TableCell>
                                  <TableCell>
                                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                      {score !== null ? score : '—'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={editGradeValue}
                                        onChange={(e) => setEditGradeValue(e.target.value)}
                                        className="w-20 h-10"
                                        autoFocus
                                      />
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`font-medium ${statusColor}`}>{status}</span>
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSaveGrade(student)} disabled={gradeLoading} className="bg-emerald-600 hover:bg-emerald-700">
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Guardar
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancelGrade}>
                                          Cancelar
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button size="sm" variant="outline" onClick={() => handleEditGrade(student)} className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 dark:hover:bg-purple-900/20 dark:hover:text-purple-400">
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Calificar
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {user.role === 'admin' && (
              <>
                {activeTab === 'courses' && (
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Gestión de Cursos</h3>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Buscar cursos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Nombre</SelectItem>
                            <SelectItem value="code">Código</SelectItem>
                            <SelectItem value="period">Período</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none"
                          >
                            <Grid3x3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button onClick={() => setShowNewCourseModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Curso
                        </Button>
                      </div>
                    </div>
                    {adminLoading ? (
                      <div className="text-center py-12 text-slate-500">Cargando cursos...</div>
                    ) : viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {adminCourses?.map((course) => (
                          <Card key={course.id} className="border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <Badge variant="outline" className="mb-2 text-xs font-medium border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                                    {course.code}
                                  </Badge>
                                  <CardTitle className="text-slate-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{course.name}</CardTitle>
                                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">{course.period}</CardDescription>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {course.description || 'Sin descripción'}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Profesor</span>
                                  {course.teacher ? (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">{course.teacher.name}</Badge>
                                  ) : (
                                    <span className="text-sm text-slate-400 italic">Sin asignar</span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedCourse(course); setSelectedTeacher(''); }} className="flex-1">
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Asignar
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Código</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Nombre</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Período</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Profesor</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adminCourses?.map((course) => (
                              <TableRow key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-medium">
                                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300 font-medium">
                                    {course.code}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-900 dark:text-white">{course.name}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{course.period}</TableCell>
                                <TableCell>
                                  {course.teacher ? (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                      {course.teacher.name}
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-400 italic">Sin asignar</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedCourse(course); setSelectedTeacher(''); }} className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400">
                                      <UserPlus className="w-4 h-4 mr-1" />
                                      Asignar
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Eliminar
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                    {coursesPagination && coursesPagination.last_page > 1 && (
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Página {coursesPagination.current_page} de {coursesPagination.last_page}
                          {adminFetching && (
                            <span className="ml-2 inline-flex items-center">
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></span>
                              Cargando...
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCoursesPage(Math.max(1, coursesPagination.current_page - 1))}
                            disabled={coursesPagination.current_page <= 1 || adminFetching}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1">
                            {coursePageNumbers.map((page) => (
                              <Button
                                key={page}
                                variant={page === coursesPagination.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCoursesPage(page)}
                                disabled={adminFetching}
                                className={page === coursesPagination.current_page ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-200 dark:border-slate-700'}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCoursesPage(Math.min(coursesPagination.last_page, coursesPagination.current_page + 1))}
                            disabled={coursesPagination.current_page >= coursesPagination.last_page || adminFetching}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'users' && (
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Gestión de Usuarios</h3>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Buscar usuarios..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="student">Alumnos</SelectItem>
                            <SelectItem value="teacher">Profesores</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setShowNewUserModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Usuario
                        </Button>
                      </div>
                    </div>
                    {usersLoading ? (
                      <div className="text-center py-12 text-slate-500">Cargando usuarios...</div>
                    ) : (
                      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Nombre</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Email</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Rol</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">DNI</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Cursos</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users?.map((u) => (
                              <TableRow key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-medium text-slate-900 dark:text-white">{u.name}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{u.email}</TableCell>
                                <TableCell>{getRoleBadge(u.role)}</TableCell>
                                <TableCell className="font-mono text-slate-600 dark:text-slate-400">{u.dni || '-'}</TableCell>
                                <TableCell>
                                  {u.role === 'teacher' ? (
                                    <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 font-medium">
                                      {teacherCourseCount(u.id)}
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {u.role !== 'admin' && (
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)} className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                                        <Pencil className="w-4 h-4 mr-1" />
                                        Editar
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}>
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Eliminar
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                    {usersPagination && usersPagination.last_page > 1 && (
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Página {usersPagination.current_page} de {usersPagination.last_page}
                          {usersFetching && (
                            <span className="ml-2 inline-flex items-center">
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></span>
                              Cargando...
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage(Math.max(1, usersPagination.current_page - 1))}
                            disabled={usersPagination.current_page <= 1 || usersFetching}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1">
                            {usersPageNumbers.map((page) => (
                              <Button
                                key={page}
                                variant={page === usersPagination.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setUsersPage(page)}
                                disabled={usersFetching}
                                className={page === usersPagination.current_page ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-200 dark:border-slate-700'}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage(Math.min(usersPagination.last_page, usersPagination.current_page + 1))}
                            disabled={usersPagination.current_page >= usersPagination.last_page || usersFetching}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'enrollments' && (
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Gestión de Matrículas</h3>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Buscar matrículas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Card className="mb-6 border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Nueva Matrícula</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <Label>Alumno</Label>
                            <select value={selectedStudentId} onChange={(e) => { setSelectedStudentId(e.target.value ? Number(e.target.value) : ''); setEnrollmentError(null); }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
                              <option value="">-- Seleccionar --</option>
                              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div className="flex-1">
                            <Label>Curso</Label>
                            <select value={selectedCourseId} onChange={(e) => { setSelectedCourseId(e.target.value ? Number(e.target.value) : ''); setEnrollmentError(null); }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
                              <option value="">-- Seleccionar --</option>
                              {adminCourses?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                          </div>
                          <Button onClick={handleCreateEnrollment} className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Matricular
                          </Button>
                        </div>
                        {enrollmentError && (
                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">{enrollmentError}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {enrollmentsLoading ? (
                      <div className="text-center py-12 text-slate-500">Cargando matrículas...</div>
                    ) : (
                      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Alumno</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Curso</TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-white">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {enrollments?.map((e: any) => (
                              <TableRow key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-medium text-slate-900 dark:text-white">{e.user?.name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300 font-medium">
                                      {e.course?.code}
                                    </Badge>
                                    <span className="text-slate-600 dark:text-slate-400">{e.course?.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteEnrollment(e.id)}>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Quitar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                    {enrollmentsPagination && enrollmentsPagination.last_page > 1 && (
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Página {enrollmentsPagination.current_page} de {enrollmentsPagination.last_page}
                          {enrollmentsFetching && (
                            <span className="ml-2 inline-flex items-center">
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></span>
                              Cargando...
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEnrollmentsPage(Math.max(1, enrollmentsPagination.current_page - 1))}
                            disabled={enrollmentsPagination.current_page <= 1 || enrollmentsFetching}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1">
                            {enrollmentsPageNumbers.map((page) => (
                              <Button
                                key={page}
                                variant={page === enrollmentsPagination.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setEnrollmentsPage(page)}
                                disabled={enrollmentsFetching}
                                className={page === enrollmentsPagination.current_page ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-200 dark:border-slate-700'}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEnrollmentsPage(Math.min(enrollmentsPagination.last_page, enrollmentsPagination.current_page + 1))}
                            disabled={enrollmentsPagination.current_page >= enrollmentsPagination.last_page || enrollmentsFetching}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* New Course Modal */}
        {showNewCourseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Nuevo Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); courseForm.handleSubmit(handleCreateCourse)(e); }} className="space-y-4">
                  <div>
                    <Label>Código</Label>
                    <Input {...courseForm.register('code')} />
                    {courseForm.formState.errors.code && (
                      <p className="text-sm text-red-600 mt-1">{courseForm.formState.errors.code.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Nombre</Label>
                    <Input {...courseForm.register('name')} />
                    {courseForm.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">{courseForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Input {...courseForm.register('description')} />
                    {courseForm.formState.errors.description && (
                      <p className="text-sm text-red-600 mt-1">{courseForm.formState.errors.description.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Período</Label>
                    <Input {...courseForm.register('period')} />
                    {courseForm.formState.errors.period && (
                      <p className="text-sm text-red-600 mt-1">{courseForm.formState.errors.period.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={courseManagementLoading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Crear</Button>
                    <Button type="button" variant="outline" onClick={() => { setShowNewCourseModal(false); courseForm.reset(); }}>Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assign Teacher Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Asignar Profesor</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">{selectedCourse.name} ({selectedCourse.code})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Profesor</Label>
                    <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
                      <option value="">-- Seleccionar --</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAssignTeacher} disabled={courseManagementLoading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Asignar</Button>
                    <Button variant="outline" onClick={() => setSelectedCourse(null)}>Cancelar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New User Modal */}
        {showNewUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Nuevo Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); userForm.handleSubmit(handleCreateUser)(e); }} className="space-y-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input {...userForm.register('name')} />
                    {userForm.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">{userForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" {...userForm.register('email')} />
                    {userForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">{userForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Contraseña</Label>
                    <Input type="password" {...userForm.register('password')} />
                    {userForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">{userForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>DNI</Label>
                    <Input {...userForm.register('dni')} />
                    {userForm.formState.errors.dni && (
                      <p className="text-sm text-red-600 mt-1">{userForm.formState.errors.dni.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <select {...userForm.register('role')} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
                      <option value="student">Alumno</option>
                      <option value="teacher">Profesor</option>
                    </select>
                    {userForm.formState.errors.role && (
                      <p className="text-sm text-red-600 mt-1">{userForm.formState.errors.role.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={userManagementLoading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Crear</Button>
                    <Button type="button" variant="outline" onClick={() => { setShowNewUserModal(false); userForm.reset(); }}>Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit User Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Editar Rol</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">{selectedUser.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Rol</Label>
                    <select value={selectedUser.role} onChange={(e) => handleUpdateUser(selectedUser.id, e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
                      <option value="student">Alumno</option>
                      <option value="teacher">Profesor</option>
                    </select>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>Cerrar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
