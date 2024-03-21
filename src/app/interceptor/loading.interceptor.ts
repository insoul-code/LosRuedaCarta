import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { finalize } from "rxjs";
import { LoadingService } from "@services/loading.service";
import { inject } from "@angular/core";

export const LoadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next:HttpHandlerFn) =>{
  const loadingService = inject(LoadingService);
  loadingService.show();
    return next(req).pipe(
      finalize(()=>{
        loadingService.hide();
      })
    )
}
