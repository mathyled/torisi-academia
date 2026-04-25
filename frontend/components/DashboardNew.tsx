'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DataTable, Column, PaginationData } from '@/components/ui/DataTable';
import { useAdminCourses, useUsers, useEnrollments, useCourseManagement, useUserManagement, useEnrollmentManagement } from '@/hooks/useAdminApi';
import { apiClient } from '@/lib/api';
import { useStudentCourses, useCourseClassmates, useCourseModules } from '@/hooks/useStudentApi';
import { useTeacherCourses, useCourseStudents, useUpdateGrade } from '@/hooks/useTeacherApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { courseSchema, userSchema, enrollmentSchema, type CourseFormData, type UserFormData, type EnrollmentFormData } from '@/lib/validations';
import { BookOpen, Users, UserCheck, GraduationCap, Plus, Trash2, Edit, CheckCircle, XCircle, UserPlus, Loader2, Check, X, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin hooks
  const {
    data: courses,
    pagination: coursesPagination,
    isLoading: coursesLoading,
    setPage: setCoursesPage,
    setSearch: setCoursesSearch,
    setSort: setCoursesSort,
    refetch: refetchCourses
  } = useAdminCourses(user?.role === 'admin');

  const {
    data: users,
    pagination: usersPagination,
    isLoading: usersLoading,
    setPage: setUsersPage,
    setSearch: setUsersSearch,
    setRole: setUsersRole,
    setSort: setUsersSort,
    refetch: refetchUsers
  } = useUsers();

  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  const {
    data: enrollments,
    pagination: enrollmentsPagination,
    isLoading: enrollmentsLoading,
    setPage: setEnrollmentsPage,
    setSearch: setEnrollmentsSearch,
    setSort: setEnrollmentsSort,
    refetch: refetchEnrollments
  } = useEnrollments();

  // Student hooks
  const { data: studentCourses, isLoading: studentLoading } = useStudentCourses(user?.role === 'student');
  const [selectedStudentCourse, setSelectedStudentCourse] = useState<any>(null);
  const { data: classmates, isLoading: classmatesLoading } = useCourseClassmates(selectedStudentCourse?.id || null);
  const { data: modules, isLoading: modulesLoading } = useCourseModules(selectedStudentCourse?.id || null);

  // Teacher hooks
  const { data: teacherCourses, isLoading: teacherLoading } = useTeacherCourses(user?.role === 'teacher');
  const [selectedTeacherCourse, setSelectedTeacherCourse] = useState<any>(null);
  const { data: courseStudents, isLoading: studentsLoading, refetch: refetchStudents } = useCourseStudents(selectedTeacherCourse?.id || 0);
  const { updateGrade, createGrade, isLoading: gradeLoading } = useUpdateGrade();
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [editGradeValue, setEditGradeValue] = useState<string>('');

  // Admin management hooks
  const { createCourse, deleteCourse, assignTeacher, isLoading: courseManagementLoading } = useCourseManagement();
  const { createUser, updateUser, deleteUser, isLoading: userManagementLoading } = useUserManagement();
  const { createEnrollment, deleteEnrollment, isLoading: enrollmentManagementLoading } = useEnrollmentManagement();

  // Modal states
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseCreateModalOpen, setCourseCreateModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userCreateModalOpen, setUserCreateModalOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'course' | 'user' | 'enrollment'; id: number; name: string } | null>(null);

  // Grade edit modal state
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<any>(null);

  // Fetch teachers for assignment modal (separate from main users list)
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    if (courseModalOpen) {
      setLoadingTeachers(true);
      apiClient.getUsers({ role: 'teacher', per_page: 100 }).then((response) => {
        setTeachersList(response.users || []);
        setLoadingTeachers(false);
      }).catch(() => {
        setLoadingTeachers(false);
      });
    }
  }, [courseModalOpen]);

  // Fetch students for enrollment modal (separate from main users list)
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (enrollmentModalOpen) {
      setLoadingStudents(true);
      apiClient.getUsers({ role: 'student', per_page: 100 }).then((response) => {
        setStudentsList(response.users || []);
        setLoadingStudents(false);
      }).catch(() => {
        setLoadingStudents(false);
      });
    }
  }, [enrollmentModalOpen]);

  // Form states
  const courseForm = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { code: '', name: '', description: '', period: '' },
  });
  const [userEditForm, setUserEditForm] = useState({ name: '', email: '', dni: '', role: '' });
  const userCreateForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'student', dni: '' },
  });
  const enrollmentForm = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { user_id: 0, course_id: 0 },
  });
  const [teacherAssignmentForm, setTeacherAssignmentForm] = useState({ teacherId: '' });
  const [teacherPopoverOpen, setTeacherPopoverOpen] = useState(false);
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
  const [coursePopoverOpen, setCoursePopoverOpen] = useState(false);

  const courseColumns: Column<any>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'code', label: 'Código', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'period', label: 'Periodo', sortable: true },
    {
      key: 'teacher',
      label: 'Profesor',
      render: (teacher: any) => teacher?.name || 'Sin asignar'
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCourse(row);
              setCourseModalOpen(true);
              setTeacherAssignmentForm({ teacherId: row.teacher?.id?.toString() || '' });
            }}
            title={row.teacher?.name ? 'Editar Profesor' : 'Asignar Profesor'}
          >
            {row.teacher?.name ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteClick('course', row.id, row.name)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const userColumns: Column<any>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'dni', label: 'DNI', sortable: true },
    {
      key: 'role',
      label: 'Rol',
      render: (role: string) => {
        const roleLabels: Record<string, string> = {
          admin: 'Administrador',
          teacher: 'Profesor',
          student: 'Estudiante',
        };
        return (
          <Badge variant={role === 'admin' ? 'default' : role === 'teacher' ? 'secondary' : 'outline'}>
            {roleLabels[role] || role}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
              setUserEditForm({
                name: row.name || '',
                email: row.email || '',
                dni: row.dni || '',
                role: row.role || ''
              });
              setUserModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {row.role !== 'admin' && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteClick('user', row.id, row.name)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const enrollmentColumns: Column<any>[] = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'user',
      label: 'Estudiante',
      render: (user: any) => user?.name || '-'
    },
    {
      key: 'course',
      label: 'Curso',
      render: (course: any) => course?.name || '-'
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (date: string) => new Date(date).toLocaleDateString('es-PE')
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleDeleteClick('enrollment', row.id, `${row.user?.name} - ${row.course?.name}`)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const renderAdminContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">{coursesPagination?.total || 0}</CardTitle>
              <p className="text-blue-100">Cursos Totales</p>
            </CardHeader>
            <CardContent>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">{usersPagination?.total || 0}</CardTitle>
              <p className="text-emerald-100">Usuarios Totales</p>
            </CardHeader>
            <CardContent>
              <Users className="w-8 h-8 text-emerald-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">{enrollmentsPagination?.total || 0}</CardTitle>
              <p className="text-purple-100">Matrículas Totales</p>
            </CardHeader>
            <CardContent>
              <UserCheck className="w-8 h-8 text-purple-200" />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'courses') {
      return (
        <>
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white">Gestión de Cursos</CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setCourseCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Curso
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={courses}
                columns={courseColumns}
                pagination={coursesPagination || undefined}
                onPageChange={setCoursesPage}
                onSearch={setCoursesSearch}
                onSort={setCoursesSort}
                loading={coursesLoading}
                searchPlaceholder="Buscar cursos..."
              />
            </CardContent>
          </Card>

          {/* Course Assignment Modal */}
          <Dialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar / Editar Profesor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Curso</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedCourse?.name}</p>
                </div>
                <div>
                  <Label>Profesor</Label>
                  <Popover open={teacherPopoverOpen} onOpenChange={setTeacherPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={teacherPopoverOpen}
                        className="w-full justify-between"
                      >
                        {teacherAssignmentForm.teacherId
                          ? teachersList.find((teacher) => teacher.id.toString() === teacherAssignmentForm.teacherId)?.name
                          : "Seleccionar profesor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar profesor..." />
                        <CommandList>
                          <CommandEmpty>No se encontró ningún profesor.</CommandEmpty>
                          <CommandGroup>
                            {teachersList.map((teacher) => (
                              <CommandItem
                                key={teacher.id}
                                value={teacher.name}
                                onSelect={() => {
                                  setTeacherAssignmentForm({ teacherId: teacher.id.toString() });
                                  setTeacherPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    teacherAssignmentForm.teacherId === teacher.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {teacher.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCourseModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => {
                    if (teacherAssignmentForm.teacherId && selectedCourse) {
                      assignTeacher(selectedCourse.id, parseInt(teacherAssignmentForm.teacherId)).then((success) => {
                        if (success) {
                          setCourseModalOpen(false);
                          setTeacherAssignmentForm({ teacherId: '' });
                          refetchCourses();
                        }
                      });
                    }
                  }}
                  disabled={courseManagementLoading}
                >
                  Asignar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Course Creation Modal */}
          <Dialog open={courseCreateModalOpen} onOpenChange={(open) => {
            setCourseCreateModalOpen(open);
            if (!open) courseForm.reset();
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Curso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Código</Label>
                  <Input
                    {...courseForm.register('code')}
                    placeholder="Ej: MAT101"
                  />
                  {courseForm.formState.errors.code && (
                    <p className="text-sm text-red-500 mt-1">{courseForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input
                    {...courseForm.register('name')}
                    placeholder="Ej: Matemáticas I"
                  />
                  {courseForm.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{courseForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    {...courseForm.register('description')}
                    placeholder="Descripción del curso"
                  />
                  {courseForm.formState.errors.description && (
                    <p className="text-sm text-red-500 mt-1">{courseForm.formState.errors.description.message}</p>
                  )}
                </div>
                <div>
                  <Label>Periodo</Label>
                  <Input
                    {...courseForm.register('period')}
                    placeholder="Ej: 2026-I"
                  />
                  {courseForm.formState.errors.period && (
                    <p className="text-sm text-red-500 mt-1">{courseForm.formState.errors.period.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCourseCreateModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => {
                    courseForm.handleSubmit((data) => {
                      createCourse(data).then((newCourse) => {
                        if (newCourse) {
                          setCourseCreateModalOpen(false);
                          courseForm.reset();
                          refetchCourses();
                        }
                      });
                    })();
                  }}
                  disabled={courseManagementLoading}
                >
                  Crear Curso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }

    if (activeTab === 'users') {
      return (
        <>
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-slate-900 dark:text-white">Gestión de Usuarios</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedRoleFilter} onValueChange={(value) => {
                    setSelectedRoleFilter(value);
                    setUsersRole(value === 'all' ? '' : value);
                  }}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="teacher">Profesor</SelectItem>
                      <SelectItem value="student">Estudiante</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setUserCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={users}
                columns={userColumns}
                pagination={usersPagination || undefined}
                onPageChange={setUsersPage}
                onSearch={setUsersSearch}
                onSort={setUsersSort}
                loading={usersLoading}
                searchPlaceholder="Buscar usuarios..."
              />
            </CardContent>
          </Card>

          {/* User Role Edit Modal */}
          <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={userEditForm.name}
                    onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={userEditForm.email}
                    onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>DNI</Label>
                  <Input
                    value={userEditForm.dni}
                    onChange={(e) => setUserEditForm({ ...userEditForm, dni: e.target.value })}
                    placeholder="8 dígitos"
                  />
                </div>
                <div>
                  <Label>Rol</Label>
                  <Select value={userEditForm.role} onValueChange={(value) => setUserEditForm({ ...userEditForm, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="teacher">Profesor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUserModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => {
                    if (selectedUser) {
                      updateUser(selectedUser.id, {
                        name: userEditForm.name,
                        email: userEditForm.email,
                        dni: userEditForm.dni,
                        role: userEditForm.role as 'student' | 'teacher'
                      }).then((success) => {
                        if (success) {
                          setUserModalOpen(false);
                          refetchUsers();
                        }
                      });
                    }
                  }}
                  disabled={userManagementLoading}
                >
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* User Creation Modal */}
          <Dialog open={userCreateModalOpen} onOpenChange={(open) => {
            setUserCreateModalOpen(open);
            if (!open) userCreateForm.reset();
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    {...userCreateForm.register('name')}
                    placeholder="Nombre completo"
                  />
                  {userCreateForm.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{userCreateForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    {...userCreateForm.register('email')}
                    placeholder="correo@ejemplo.com"
                  />
                  {userCreateForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{userCreateForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    {...userCreateForm.register('password')}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {userCreateForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">{userCreateForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <Label>DNI</Label>
                  <Input
                    {...userCreateForm.register('dni')}
                    placeholder="8 dígitos (opcional)"
                  />
                  {userCreateForm.formState.errors.dni && (
                    <p className="text-sm text-red-500 mt-1">{userCreateForm.formState.errors.dni.message}</p>
                  )}
                </div>
                <div>
                  <Label>Rol</Label>
                  <Select
                    value={userCreateForm.watch('role')}
                    onValueChange={(value) => userCreateForm.setValue('role', value as 'student' | 'teacher')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="teacher">Profesor</SelectItem>
                    </SelectContent>
                  </Select>
                  {userCreateForm.formState.errors.role && (
                    <p className="text-sm text-red-500 mt-1">{userCreateForm.formState.errors.role.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUserCreateModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => {
                    userCreateForm.handleSubmit((data) => {
                      createUser(data).then((response) => {
                        if (response) {
                          setUserCreateModalOpen(false);
                          userCreateForm.reset();
                          refetchUsers();
                        }
                      });
                    })();
                  }}
                  disabled={userManagementLoading}
                >
                  Crear Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }

    if (activeTab === 'enrollments') {
      return (
        <>
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white">Gestión de Matrículas</CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setEnrollmentModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Matrícula
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={enrollments}
                columns={enrollmentColumns}
                pagination={enrollmentsPagination || undefined}
                onPageChange={setEnrollmentsPage}
                onSearch={setEnrollmentsSearch}
                onSort={setEnrollmentsSort}
                loading={enrollmentsLoading}
                searchPlaceholder="Buscar matrículas..."
              />
            </CardContent>
          </Card>

          {/* Enrollment Creation Modal */}
          <Dialog open={enrollmentModalOpen} onOpenChange={(open) => {
            setEnrollmentModalOpen(open);
            if (!open) enrollmentForm.reset();
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Matrícula</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Estudiante</Label>
                  <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={studentPopoverOpen}
                        className="w-full justify-between"
                      >
                        {enrollmentForm.watch("user_id")
                          ? studentsList.find((student) => student.id === enrollmentForm.watch("user_id"))?.name
                          : "Seleccionar estudiante..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar estudiante..." />
                        <CommandList>
                          <CommandEmpty>No se encontró ningún estudiante.</CommandEmpty>
                          <CommandGroup>
                            {studentsList.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.name}
                                onSelect={() => {
                                  enrollmentForm.setValue("user_id", student.id);
                                  setStudentPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    enrollmentForm.watch("user_id") === student.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {student.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {enrollmentForm.formState.errors.user_id && (
                    <p className="text-sm text-red-500 mt-1">{enrollmentForm.formState.errors.user_id.message}</p>
                  )}
                </div>
                <div>
                  <Label>Curso</Label>
                  <Popover open={coursePopoverOpen} onOpenChange={setCoursePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={coursePopoverOpen}
                        className="w-full justify-between"
                      >
                        {enrollmentForm.watch("course_id")
                          ? courses?.find((course: any) => course.id === enrollmentForm.watch("course_id"))?.name
                          : "Seleccionar curso..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar curso..." />
                        <CommandList>
                          <CommandEmpty>No se encontró ningún curso.</CommandEmpty>
                          <CommandGroup>
                            {courses?.map((course: any) => (
                              <CommandItem
                                key={course.id}
                                value={course.name}
                                onSelect={() => {
                                  enrollmentForm.setValue("course_id", course.id);
                                  setCoursePopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    enrollmentForm.watch("course_id") === course.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {course.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {enrollmentForm.formState.errors.course_id && (
                    <p className="text-sm text-red-500 mt-1">{enrollmentForm.formState.errors.course_id.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEnrollmentModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => {
                    enrollmentForm.handleSubmit((data) => {
                      createEnrollment(data.user_id, data.course_id).then((success) => {
                        if (success) {
                          setEnrollmentModalOpen(false);
                          enrollmentForm.reset();
                          refetchEnrollments();
                        }
                      });
                    })();
                  }}
                  disabled={enrollmentManagementLoading}
                >
                  Crear Matrícula
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }

    return null;
  };

  const renderStudentContent = () => {
    if (!selectedStudentCourse) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentLoading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Cargando cursos...</div>
          ) : (
            studentCourses?.map((course: any) => (
              <Card
                key={course.id}
                className="border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => setSelectedStudentCourse(course)}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <CardHeader className="pb-4">
                  <Badge variant="outline" className="mb-2 text-xs font-medium border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300 w-fit">
                    {course.code}
                  </Badge>
                  <CardTitle className="text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.name}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{course.period}</p>
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
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Nota</span>
                        <span className={`text-lg font-bold ${course.grade.score >= 11 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {course.grade.score}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-sm text-slate-500">Sin calificación</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentCourse(course);
                        }}
                      >
                        Ver Módulos y Compañeros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedStudentCourse(null)}>
          ← Volver a cursos
        </Button>

        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">{selectedStudentCourse.name}</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedStudentCourse.code} - {selectedStudentCourse.period}</p>
              </div>
              {selectedStudentCourse.teacher && (
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                  Profesor: {selectedStudentCourse.teacher.name}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Módulos del Curso</CardTitle>
          </CardHeader>
          <CardContent>
            {modulesLoading ? (
              <div className="text-center py-12 text-slate-500">Cargando módulos...</div>
            ) : modules && modules.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {modules.map((module: any) => (
                  <AccordionItem key={module.id} value={`module-${module.id}`} className="border-slate-200 dark:border-slate-700">
                    <AccordionTrigger className="hover:no-underline py-4 px-2">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {module.order}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{module.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-12 pb-4">
                      {module.description ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {module.description}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Sin descripción para este módulo.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 text-slate-500">No hay módulos disponibles.</div>
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
              <div className="space-y-3">
                {classmates.map((classmate: any) => (
                  <div key={classmate.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{classmate.user?.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{classmate.user?.dni || '-'}</p>
                      </div>
                      {classmate.grade?.score != null && (
                        <Badge className={classmate.grade.score >= 11 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                          {classmate.grade.score}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">No hay compañeros matriculados.</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Delete confirmation handlers
  const handleDeleteClick = (type: 'course' | 'user' | 'enrollment', id: number, name: string) => {
    setDeleteItem({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    let success = false;
    switch (deleteItem.type) {
      case 'course':
        success = await deleteCourse(deleteItem.id);
        if (success) refetchCourses();
        break;
      case 'user':
        success = await deleteUser(deleteItem.id);
        if (success) refetchUsers();
        break;
      case 'enrollment':
        success = await deleteEnrollment(deleteItem.id);
        if (success) refetchEnrollments();
        break;
    }

    if (success) {
      setDeleteDialogOpen(false);
      setDeleteItem(null);
    }
  };

  // Teacher grading handlers
  const handleEditGrade = (student: any) => {
    setSelectedStudentForGrade(student);
    setEditGradeValue(student.grade?.score?.toString() || '');
    setGradeModalOpen(true);
  };

  const handleCancelEdit = () => {
    setGradeModalOpen(false);
    setSelectedStudentForGrade(null);
    setEditGradeValue('');
  };

  const handleSaveGrade = async () => {
    if (!selectedStudentForGrade) return;

    const score = editGradeValue === '' ? null : Math.min(20, Math.max(0, parseInt(editGradeValue, 10)));

    if (score === null) {
      handleCancelEdit();
      return;
    }

    const period = selectedTeacherCourse?.period || '2025-I';
    let result = null;
    if (selectedStudentForGrade.grade) {
      // Update existing grade
      result = await updateGrade(selectedStudentForGrade.grade.id, score, period);
    } else {
      // Create new grade
      result = await createGrade(selectedStudentForGrade.id, score, period);
    }

    if (result) {
      setGradeModalOpen(false);
      setSelectedStudentForGrade(null);
      setEditGradeValue('');
      // Refresh students list to show updated grades
      refetchStudents();
    }
  };

  const renderTeacherContent = () => {
    if (!selectedTeacherCourse) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherLoading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Cargando cursos...</div>
          ) : (
            teacherCourses?.map((course: any) => (
              <Card
                key={course.id}
                className="border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => setSelectedTeacherCourse(course)}
              >
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardHeader className="pb-4">
                  <Badge variant="outline" className="mb-2 text-xs font-medium border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300 w-fit">
                    {course.code}
                  </Badge>
                  <CardTitle className="text-slate-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{course.name}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{course.period}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-slate-500">Click para gestionar calificaciones</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedTeacherCourse(null)}>
          ← Volver a cursos
        </Button>

        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <CardTitle className="text-slate-900 dark:text-white">{selectedTeacherCourse.name}</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">{selectedTeacherCourse.code} - {selectedTeacherCourse.period}</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-12 text-slate-500">Cargando estudiantes...</div>
            ) : courseStudents && courseStudents.length > 0 ? (
              <div className="space-y-3">
                {courseStudents.map((student: any) => (
                  <div key={student.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{student.user.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{student.user.dni || '-'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {student.grade?.score != null ? (
                          <div className="text-right mr-2">
                            <Badge className={student.grade.score >= 11 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm px-3' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm px-3'}>
                              {student.grade.score}
                            </Badge>
                            <p className="text-[10px] text-slate-500 mt-0.5">Nota Final</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="mr-2">Pendiente</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGrade(student)}
                          className="hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Calificar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">No hay estudiantes matriculados.</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const getDeleteDialogTitle = () => {
    switch (deleteItem?.type) {
      case 'course': return 'Eliminar Curso';
      case 'user': return 'Eliminar Usuario';
      case 'enrollment': return 'Eliminar Matrícula';
      default: return 'Confirmar Eliminación';
    }
  };

  const getDeleteDialogDescription = () => {
    switch (deleteItem?.type) {
      case 'course': return `¿Estás seguro de que deseas eliminar el curso "${deleteItem?.name}"? Esta acción no se puede deshacer.`;
      case 'user': return `¿Estás seguro de que deseas eliminar al usuario "${deleteItem?.name}"? Esta acción no se puede deshacer.`;
      case 'enrollment': return `¿Estás seguro de que deseas eliminar la matrícula de "${deleteItem?.name}"? Esta acción no se puede deshacer.`;
      default: return '¿Estás seguro de que deseas eliminar este elemento?';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {user?.role === 'admin' && renderAdminContent()}
          {user?.role === 'student' && renderStudentContent()}
          {user?.role === 'teacher' && renderTeacherContent()}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              {getDeleteDialogTitle()}
            </DialogTitle>
            <DialogDescription>
              {getDeleteDialogDescription()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Grade Edit Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Calificar Estudiante</DialogTitle>
            <DialogDescription>
              Asigna o edita la nota para {selectedStudentForGrade?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <Label className="text-sm text-slate-500 mb-2 block">Puntaje (0-20)</Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={editGradeValue}
                onChange={(e) => setEditGradeValue(e.target.value)}
                className="w-24 text-center text-3xl h-16 font-bold"
                placeholder="0"
                autoFocus
              />
            </div>
            <div className="w-full flex justify-between text-xs text-slate-400 px-8">
              <span>Desaprobado (0-10)</span>
              <span>Aprobado (11-20)</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveGrade}
              disabled={gradeLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {gradeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Guardar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
