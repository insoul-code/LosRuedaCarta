import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './interceptor/loading.interceptor';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { httpInterceptor } from '@interceptor/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors(
      [
        LoadingInterceptor,
        httpInterceptor
      ]
    ), withFetch()),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(
        {
          apiKey: "AIzaSyAGPx-qtWwqBYHkCQZlk4T2TEy8atJnskk",
          authDomain: "losruedacarta.firebaseapp.com",
          databaseURL: "https://losruedacarta-default-rtdb.firebaseio.com",
          projectId: "losruedacarta",
          storageBucket: "losruedacarta.appspot.com",
          messagingSenderId: "866416049543",
          appId: "1:866416049543:web:25ddaec4f58d976d276722"
        }
      )),
      provideAuth(() => getAuth()),
    ]),
  ]
};
