import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KollusPlayerComponent } from './components/kollus-player/kollus-player.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';

const DEFAULT_CUID = 'guest';

interface PlayerConfig {
  secretKey: string;
  customKey: string;
  cuid: string;
  mediaContentKey: string;
}

/**
 * Kollus 미디어 플랫폼 연동 샘플 (Angular): 플레이어 임베드 + 파일 업로드 데모.
 * 백엔드 없이 동작하며, JWT는 브라우저에서 폼 입력값으로 직접 서명한다.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, KollusPlayerComponent, FileUploaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  secretKey = '';
  customKey = '';
  cuid = DEFAULT_CUID;
  mediaContentKey = '';
  // 타이핑 중 매 글자마다 JWT 서명/플레이어 로드가 반복되지 않도록,
  // 버튼 클릭 시점의 입력값 스냅샷으로만 플레이어를 렌더링한다.
  appliedConfig: PlayerConfig | null = null;

  get canLoadPlayer(): boolean {
    return Boolean(this.secretKey && this.customKey && this.cuid && this.mediaContentKey);
  }

  onLoadPlayer(): void {
    this.appliedConfig = {
      secretKey: this.secretKey,
      customKey: this.customKey,
      cuid: this.cuid,
      mediaContentKey: this.mediaContentKey,
    };
  }
}
