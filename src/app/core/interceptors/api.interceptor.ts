import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  let apiReq = req;

  // Si la petición es relativa (empieza con '/'), anteponemos la URL base de la API
  if (req.url.startsWith('/')) {
    apiReq = req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
  }

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error detectado en ApiInterceptor:', error);
      return throwError(() => new Error(error.message || 'Error de conexión HTTP'));
    })
  );
};
