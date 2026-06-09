import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message || 'Ocorreu um erro inesperado.';

      if (error.status === 401 && !req.url.includes('/auth/')) {
        auth.logout();
        router.navigate(['/auth']);
      } else if (error.status !== 0 && !req.url.includes('/auth/')) {
        toast.show(message, 'error');
      }

      return throwError(() => error);
    })
  );
};
