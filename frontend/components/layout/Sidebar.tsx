'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserCheck, 
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ activeTab, onTabChange, isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'courses',
      label: 'Cursos',
      icon: BookOpen,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      roles: ['admin'],
    },
    {
      id: 'enrollments',
      label: 'Matrículas',
      icon: UserCheck,
      roles: ['admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'student')
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed lg:relative z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col h-screen',
        'lg:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isCollapsed ? 'lg:w-20 w-64' : 'w-64'
      )}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              {!isCollapsed && (
                <div className="hidden lg:block">
                  <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Academia</h1>
                  <p className="text-xs text-slate-400">Sistema de Gestión</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onMobileClose();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group',
                  'hover:bg-slate-700/50 hover:shadow-lg',
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 text-white' 
                    : 'text-slate-300 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isCollapsed && 'mx-auto')} />
                {!isCollapsed && (
                  <span className="font-medium text-sm lg:text-base">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Toggle & Logout */}
        <div className="p-3 lg:p-4 border-t border-slate-700/50 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50 hidden lg:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span>Colapsar</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              'w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors',
              isCollapsed && 'justify-center lg:justify-center'
            )}
          >
            <LogOut className={cn('w-5 h-5', !isCollapsed && 'mr-2')} />
            {!isCollapsed && <span className="hidden lg:inline">Cerrar Sesión</span>}
          </Button>
        </div>
      </div>
    </>
  );
}
