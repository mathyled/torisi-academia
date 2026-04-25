"use client"

import { useState } from "react"

interface Student {
  id: number
  name: string
  dni: string
  grade: number | null
}

interface Course {
  id: string
  name: string
  code: string
  students: Student[]
}

interface TeacherDashboardProps {
  teacherName: string
  onLogout: () => void
}

const mockCourses: Course[] = [
  {
    id: "1",
    name: "Motores de Combustión Interna",
    code: "MOT-101",
    students: [
      { id: 1, name: "Luis Mamani Quispe", dni: "74521836", grade: 14 },
      { id: 2, name: "Ana Torres Paredes", dni: "71234567", grade: null },
      { id: 3, name: "Kevin Salas Huanca", dni: "73456789", grade: 8 },
    ],
  },
  {
    id: "2",
    name: "Sistemas de Inyección Electrónica",
    code: "INY-202",
    students: [
      { id: 4, name: "María Fernández López", dni: "72345678", grade: 17 },
      { id: 5, name: "Carlos Ruiz Mendoza", dni: "75123456", grade: 12 },
    ],
  },
]

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export default function TeacherDashboard({ teacherName, onLogout }: TeacherDashboardProps) {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [selectedCourseId, setSelectedCourseId] = useState<string>(mockCourses[0].id)
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null)
  const [editGradeValue, setEditGradeValue] = useState<string>("")
  const [toast, setToast] = useState<{ show: boolean; studentName: string }>({ show: false, studentName: "" })

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)!
  const initials = teacherName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleEdit = (student: Student) => {
    setEditingStudentId(student.id)
    setEditGradeValue(student.grade !== null ? student.grade.toString() : "")
  }

  const handleCancel = () => {
    setEditingStudentId(null)
    setEditGradeValue("")
  }

  const handleSave = (studentId: number) => {
    const newGrade = editGradeValue === "" ? null : Math.min(20, Math.max(0, parseInt(editGradeValue, 10)))

    setCourses((prev) =>
      prev.map((course) => {
        if (course.id === selectedCourseId) {
          return {
            ...course,
            students: course.students.map((student) =>
              student.id === studentId ? { ...student, grade: newGrade } : student
            ),
          }
        }
        return course
      })
    )

    const studentName = selectedCourse.students.find((s) => s.id === studentId)?.name || ""
    setToast({ show: true, studentName })
    setTimeout(() => setToast({ show: false, studentName: "" }), 3000)

    setEditingStudentId(null)
    setEditGradeValue("")
  }

  const getGradeStatus = (grade: number | null) => {
    if (grade === null) return { label: "Pendiente", color: "bg-gray-100 text-gray-700" }
    if (grade >= 11) return { label: "Aprobado", color: "bg-emerald-100 text-emerald-700" }
    return { label: "Desaprobado", color: "bg-red-100 text-red-700" }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">
            Nota de {toast.studentName} actualizada correctamente
          </span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{teacherName}</h1>
              <p className="text-sm text-muted-foreground">Docente</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Course Selector */}
        <div className="mb-8">
          <label htmlFor="course-select" className="mb-2 block text-sm font-medium text-foreground">
            Seleccionar Curso
          </label>
          <div className="relative w-full max-w-md">
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value)
                setEditingStudentId(null)
              }}
              className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-3 pr-10 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Course Info Card */}
        <div className="mb-6 rounded-xl bg-accent p-6 text-accent-foreground">
          <h2 className="text-xl font-bold">{selectedCourse.name}</h2>
          <p className="mt-1 text-sm opacity-80">
            Código: {selectedCourse.code} &bull; {selectedCourse.students.length} estudiantes matriculados
          </p>
        </div>

        {/* Students Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Alumno
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nota Actual
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nueva Nota
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selectedCourse.students.map((student, index) => {
                  const isEditing = editingStudentId === student.id
                  const status = getGradeStatus(student.grade)

                  return (
                    <tr key={student.id} className="transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-foreground">{student.name}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {student.dni}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-lg font-semibold text-foreground">
                          {student.grade !== null ? student.grade : "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={editGradeValue}
                            onChange={(e) => setEditGradeValue(e.target.value)}
                            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(student.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                              title="Guardar"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
                              title="Cancelar"
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(student)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                            title="Editar nota"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium">Leyenda:</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Aprobado
            </span>
            <span>Nota &ge; 11</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              Desaprobado
            </span>
            <span>Nota &lt; 11</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
              Pendiente
            </span>
            <span>Sin nota</span>
          </div>
        </div>
      </main>
    </div>
  )
}
