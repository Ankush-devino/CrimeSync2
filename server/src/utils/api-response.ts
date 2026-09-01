// Standardized API Response Helper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export function formatResponse<T>(success: boolean, data?: T, message?: string, error?: string): ApiResponse<T> {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}
