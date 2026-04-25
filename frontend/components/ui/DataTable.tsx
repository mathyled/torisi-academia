'use client';

import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  searchPlaceholder?: string;
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  onPageChange,
  onSearch,
  onSort,
  loading = false,
  searchPlaceholder = 'Buscar...',
}: DataTableProps<T>) {
  const dataArray = Array.isArray(data) ? data : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(normalizeText(value));
  };

  const handleSort = (columnKey: string) => {
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort?.(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 opacity-20" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={cn(
                      'font-semibold text-slate-900 dark:text-white whitespace-nowrap',
                      column.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && getSortIcon(String(column.key))}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : dataArray.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500">
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                dataArray.map((row, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)} className="text-slate-900 dark:text-white whitespace-nowrap">
                        {column.render
                          ? column.render(row[column.key as keyof T], row)
                          : String(row[column.key as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
            <span className="hidden sm:inline">Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} registros</span>
            <span className="sm:hidden">{pagination.current_page} / {pagination.last_page}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="border-slate-200 dark:border-slate-700"
            >
              <ChevronUp className="w-4 h-4 sm:hidden" />
              <ChevronLeft className="w-4 h-4 hidden sm:block" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                let pageNum;
                if (pagination.last_page <= 5) {
                  pageNum = i + 1;
                } else if (pagination.current_page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.current_page >= pagination.last_page - 2) {
                  pageNum = pagination.last_page - 4 + i;
                } else {
                  pageNum = pagination.current_page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.current_page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange?.(pageNum)}
                    className={cn(
                      'w-8 h-8',
                      pagination.current_page === pageNum
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'border-slate-200 dark:border-slate-700'
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="border-slate-200 dark:border-slate-700"
            >
              <ChevronDown className="w-4 h-4 sm:hidden" />
              <ChevronRight className="w-4 h-4 hidden sm:block" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
