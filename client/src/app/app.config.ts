import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptor/error-interceptor';
import { loadingInterceptor } from './core/interceptor/loading-interceptor';
import { InitService } from './core/service/init.service';
import { lastValueFrom } from 'rxjs';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

function initializeApp(initService: InitService) {
  return () => {
    lastValueFrom(initService.init()).finally(() => {
      const splash = document.getElementById('inital-splash');
      if (splash) {
        splash.remove();
      }
    })
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor, loadingInterceptor])),
    provideAppInitializer(async () => {
      const initService = inject(InitService);

      return lastValueFrom(initService.init()).finally(() => {
        const splash = document.getElementById('inital-splash');
        if (splash) {
          splash.remove();
        }
      })
    }),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { autoFocus: 'diaglog', restoreFocus: true }
    }
  ]
};
