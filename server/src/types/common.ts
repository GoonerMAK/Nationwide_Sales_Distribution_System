export interface PaginationMeta {
  offset: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
}
