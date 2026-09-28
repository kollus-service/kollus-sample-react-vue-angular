// Angular 애플리케이션 전역 설정: Zone 변경 감지 옵션과 HttpClient 프로바이더를 등록한다.
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideHttpClient()],
};
