import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((result) => {
        if (result === undefined || result === null) {
          return { data: null as any, message: 'Success', success: true };
        }
        // Allow controllers to fully shape the response (e.g. exports / files)
        if (result?.success === true && 'data' in result && 'message' in result) {
          return result;
        }
        if (typeof result === 'object' && result !== null && 'items' in result && 'meta' in result) {
          return {
            data: result.items,
            message: result.message ?? 'Success',
            success: true,
            meta: result.meta,
          };
        }
        if (typeof result === 'object' && result !== null && 'data' in result && 'meta' in result) {
          return {
            data: result.data,
            message: result.message ?? 'Success',
            success: true,
            meta: result.meta,
          };
        }
        return { data: result, message: 'Success', success: true };
      }),
    );
  }
}
