// Angular 앱 진입점: appConfig로 AppComponent를 부트스트랩한다.
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    // 부트스트랩 실패: 콘솔에 남겨 원인 확인
    console.error(err);
  });
