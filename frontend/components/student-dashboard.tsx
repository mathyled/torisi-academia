"use client";

import { BookOpen, CheckCircle, XCircle, TrendingUp, LogOut, GraduationCap, Car } from "lucide-react";

interface Grade {
  course: string;
  code: string;
  teacher: string;
  grade: number | null;
  period: string;
}

interface StudentDashboardProps {
  studentName: string;
  onLogout: () => void;
}

const mockGrades: Grade[] = [
  { course: "Motores de Combustión Interna", code: "MOT-101", teacher: "Ing. Carlos Ríos", grade: 16, period: "2025-I" },
  { course: "Electrónica Automotriz", code: "ELEC-201", teacher: "Ing. Patricia Vega", grade: 9, period: "2025-I" },
  { course: "Sistemas de Transmisión", code: "CAJA-102", teacher: "Ing. Jorge Llanos", grade: null, period: "2025-I" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStatus(grade: number | null): { label: string; className: string } {
  if (grade === null) {
    return { label: "Pendiente", className: "bg-gray-100 text-gray-700" };
  }
  if (grade >= 11) {
    return { label: "Aprobado", className: "bg-emerald-100 text-emerald-700" };
  }
  return { label: "Desaprobado", className: "bg-red-100 text-red-700" };
}

export default function StudentDashboard({ studentName, onLogout }: StudentDashboardProps) {
  const totalCourses = mockGrades.length;
  const gradedCourses = mockGrades.filter((g) => g.grade !== null);
  const approved = gradedCourses.filter((g) => g.grade! >= 11).length;
  const failed = gradedCourses.filter((g) => g.grade! < 11).length;
  const average =
    gradedCourses.length > 0
      ? (gradedCourses.reduce((sum, g) => sum + g.grade!, 0) / gradedCourses.length).toFixed(1)
      : "-";

  const summaryCards = [
    { label: "Total Cursos", value: totalCourses, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Aprobados", value: approved, icon: CheckCircle, color: "bg-emerald-100 text-emerald-600" },
    { label: "Desaprobados", value: failed, icon: XCircle, color: "bg-red-100 text-red-600" },
    { label: "Promedio", value: average, icon: TrendingUp, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Car className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">Instituto Técnico Automotriz</h1>
              <p className="text-sm text-muted-foreground">Sistema de Calificaciones</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {getInitials(studentName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{studentName}</p>
                <p className="text-xs text-muted-foreground">Estudiante</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Welcome Card */}
        <div className="mb-8 rounded-xl bg-accent p-6 text-accent-foreground sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-accent-foreground/70">Bienvenido de vuelta</p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Hola, {studentName.split(" ")[0]}</h2>
              <p className="mt-2 text-accent-foreground/70">
                Aquí puedes ver el progreso de tus cursos y calificaciones.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent-foreground/10 px-4 py-2">
              <GraduationCap className="h-5 w-5" />
              <span className="font-semibold">Periodo 2025-I</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Grades Table */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">Mis Calificaciones</h3>
            <p className="text-sm text-muted-foreground">Periodo académico 2025-I</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Profesor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nota
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockGrades.map((grade) => {
                  const status = getStatus(grade.grade);
                  return (
                    <tr key={grade.code} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{grade.course}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-muted px-2 py-1 text-sm font-mono text-muted-foreground">
                          {grade.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{grade.teacher}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-foreground">
                          {grade.grade !== null ? grade.grade : "-"}
                        </span>
                        <span className="text-sm text-muted-foreground">/20</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-border md:hidden">
            {mockGrades.map((grade) => {
              const status = getStatus(grade.grade);
              return (
                <div key={grade.code} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{grade.course}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{grade.teacher}</p>
                      <span className="mt-2 inline-block rounded-md bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                        {grade.code}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {grade.grade !== null ? grade.grade : "-"}
                        <span className="text-sm font-normal text-muted-foreground">/20</span>
                      </p>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
