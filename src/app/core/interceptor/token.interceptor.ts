import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = sessionStorage.getItem('lumen_token');

  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (authToken && isApiUrl) {
    const newReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return next(newReq);
  }

  return next(req);
};
