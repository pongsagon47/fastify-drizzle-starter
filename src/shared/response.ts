export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, message, data };
}

export function createMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  if (total > 0 && page > totalPages) {
    throw new Error('Page is out of range');
  }

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1 && page <= totalPages;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

export function paginatedResponse<T>(
  data: T,
  meta: PaginationMeta,
  message?: string
): ApiResponse<T> {
  return { success: true, message, data, meta };
}

export function errorResponse(message: string): ApiResponse<never> {
  return { success: false, message };
}
